import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const [
      totalOrders,
      paidOrders,
      totalRevenueResult,
      totalPageviews,
      recentEvents,
      topPagesGrouped,
      newsletterCount,
    ] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "PAID" } }),
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "PAID" },
      }),
      db.analyticsEvent.count(),
      db.analyticsEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      db.analyticsEvent.groupBy({
        by: ["pageUrl"],
        _count: { pageUrl: true },
        orderBy: { _count: { pageUrl: "desc" } },
        take: 8,
      }),
      db.newsletterSubscriber.count(),
    ]);

    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;
    const conversionRate = totalPageviews > 0 ? ((paidOrders / totalPageviews) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        paidOrders,
        totalPageviews,
        conversionRate,
        newsletterCount,
      },
      topPages: topPagesGrouped.map((p) => ({ url: p.pageUrl, count: p._count.pageUrl })),
      recentEvents,
    });
  } catch (error) {
    console.error("Admin analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
