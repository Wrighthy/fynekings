import { db } from "@/lib/db";
import type { Order } from "@prisma/client";

// Shared post-payment logic. Both the Paystack webhook and the redirect
// verification route funnel through markOrderPaid(), so inventory and the
// customer receipt behave identically no matter which path confirms the
// payment first.

type PricedItem = {
  name: string;
  series: string;
  amount: number;
  fee: number;
  custom: { strapName: string; caseName: string; dialName: string } | null;
};

function orderItems(order: Order): PricedItem[] {
  const raw = order.customConfig;
  if (!Array.isArray(raw)) return [];

  const items: PricedItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.name !== "string") continue;

    const c = candidate.custom;
    const custom =
      c && typeof c === "object" && !Array.isArray(c)
        ? {
            strapName: String((c as Record<string, unknown>).strapName || ""),
            caseName: String((c as Record<string, unknown>).caseName || ""),
            dialName: String((c as Record<string, unknown>).dialName || ""),
          }
        : null;

    items.push({
      name: candidate.name,
      series: typeof candidate.series === "string" ? candidate.series : "",
      amount: typeof candidate.amount === "number" ? candidate.amount : 0,
      fee: typeof candidate.fee === "number" ? candidate.fee : 0,
      custom,
    });
  }
  return items;
}

// Marks the order PAID exactly once: the conditional updateMany means the
// webhook and the redirect verify can race and only one of them performs
// the side effects. Returns the updated order, or null when the order was
// already PAID (idempotent no-op).
export async function markOrderPaid(orderId: string): Promise<Order | null> {
  const result = await db.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "PAID" },
  });
  if (result.count === 0) return null;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  // Inventory and the receipt are best-effort — a failure in either must
  // never undo or block the payment confirmation itself.
  try {
    await updateInventory(order);
  } catch (error) {
    console.error(`Inventory update failed for order ${order.id}:`, error);
  }

  try {
    await sendOrderConfirmation(order);
  } catch (error) {
    console.error(`Order confirmation email failed for order ${order.id}:`, error);
  }

  return order;
}

// Decrements catalog stock for each purchased item and increments the
// limited edition's sold counter. Custom builds have no inventory.
async function updateInventory(order: Order) {
  const items = orderItems(order);

  // Legacy single-product orders stored productId instead of pricedItems
  if (items.length === 0 && order.productId) {
    const product = await db.product.findUnique({ where: { id: order.productId } });
    if (product) {
      await db.product.update({
        where: { id: product.id },
        data: {
          stockCount: { decrement: 1 },
          inStock: product.stockCount - 1 > 0,
        },
      });
    }
    return;
  }

  for (const item of items) {
    if (item.custom) continue; // custom build — not inventoried

    const product = await db.product.findFirst({ where: { name: item.name, series: item.series } });
    if (product) {
      await db.product.update({
        where: { id: product.id },
        data: {
          stockCount: { decrement: 1 },
          inStock: product.stockCount - 1 > 0,
        },
      });
      continue;
    }

    const edition = await db.limitedEdition.findFirst({
      where: { name: item.name },
      orderBy: { createdAt: "desc" },
    });
    if (edition && edition.soldCount < edition.totalStock) {
      await db.limitedEdition.update({
        where: { id: edition.id },
        data: { soldCount: { increment: 1 } },
      });
    }
  }
}

// Emails the customer a receipt on payment. Requires Resend to be
// configured; silently skipped otherwise.
async function sendOrderConfirmation(order: Order) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;
  if (!order.customerEmail) return;

  const items = orderItems(order);
  const itemsHtml = items.length
    ? items
        .map(
          (i) => `
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #F4EFE4; font-size: 0.85rem;">
                ${i.name}
                ${i.custom ? `<br/><span style="color: #5A5550; font-size: 0.7rem;">${i.custom.strapName} strap · ${i.custom.caseName} case · ${i.custom.dialName} dial</span>` : ""}
              </td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right; font-size: 0.85rem;">₦${i.amount.toLocaleString()}</td>
            </tr>`
        )
        .join("")
    : `
            <tr style="border-bottom: 1px solid #2a2a2a;">
              <td style="padding: 12px 0; color: #F4EFE4; font-size: 0.85rem;">Fynekings timepiece</td>
              <td style="padding: 12px 0; color: #F4EFE4; text-align: right; font-size: 0.85rem;">₦${order.totalAmount.toLocaleString()}</td>
            </tr>`;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: order.customerEmail,
    subject: `Your Fynekings order #${order.id.slice(-8).toUpperCase()} is confirmed`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #0a0a0a; color: #F4EFE4;">
        <h1 style="color: #C4A962; font-size: 1.8rem; margin-bottom: 8px;">Acquisition Confirmed</h1>
        <p style="color: #5A5550; font-size: 0.8rem; margin-bottom: 24px;">Fynekings International · Lagos</p>
        <p style="line-height: 1.8; margin-bottom: 32px;">
          Thank you${order.customerName ? `, ${order.customerName}` : ""}. Your payment has been verified and your order
          <strong style="color: #C4A962;">#${order.id.slice(-8).toUpperCase()}</strong> is now with our master watchmaker.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          ${itemsHtml}
          <tr>
            <td style="padding: 16px 0; color: #C4A962; font-size: 0.85rem; font-weight: bold;">Total paid</td>
            <td style="padding: 16px 0; color: #C4A962; text-align: right; font-size: 0.85rem; font-weight: bold;">₦${order.totalAmount.toLocaleString()}</td>
          </tr>
        </table>
        <p style="color: #5A5550; font-size: 0.7rem; line-height: 1.8;">
          What happens next: final timing calibration &amp; 5ATM pressure testing, signature packaging with your 5-Year NFC
          warranty, then insured dispatch via armed express courier — tracking details follow by SMS &amp; email.<br/><br/>
          Fynekings International Ltd · Victoria Island, Lagos
        </p>
      </div>
    `,
  });
}
