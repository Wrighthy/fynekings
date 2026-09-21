import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { markOrderPaid } from "@/lib/orderFulfillment";

export async function GET(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereCondition = status && status !== "ALL" ? { status: status as any } : {};

    const orders = await db.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        payments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required." }, { status: 400 });
    }

    let updated;
    if (status === "PAID") {
      // Transitioning to PAID triggers inventory deduction and confirmation receipt
      updated = await markOrderPaid(orderId, {
        gatewayResponse: "Manually verified by admin",
      });
      if (!updated) {
        // If order was not in PENDING status, still update directly
        updated = await db.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
      }
    } else {
      updated = await db.order.update({
        where: { id: orderId },
        data: { status },
      });

      if (status === "CANCELLED") {
        await db.payment.updateMany({
          where: { orderId, status: "PENDING" },
          data: { status: "CANCELLED", gatewayResponse: "Order cancelled by admin" },
        });
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
