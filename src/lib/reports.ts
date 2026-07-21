import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function getSalesReport(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: { not: "DIBATALKAN" },
    },
    include: {
      items: { include: { menuItem: true } },
      payment: true,
      table: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOmzet = orders.reduce((sum, o) => sum + (o.payment?.amount ?? 0), 0);
  const totalTransaksi = orders.length;
  const rataRata = totalTransaksi > 0 ? Math.round(totalOmzet / totalTransaksi) : 0;

  const byMethod = { TUNAI: 0, QRIS: 0, TRANSFER: 0 };
  for (const o of orders) {
    if (o.payment) byMethod[o.payment.method] += o.payment.amount;
  }

  const byDayMap = new Map<string, number>();
  for (const o of orders) {
    const key = format(o.createdAt, "yyyy-MM-dd");
    byDayMap.set(key, (byDayMap.get(key) ?? 0) + (o.payment?.amount ?? 0));
  }
  const chartData = Array.from(byDayMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date: format(new Date(date), "dd/MM"), total }));

  const menuCount = new Map<string, { name: string; qty: number; total: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const existing = menuCount.get(item.menuItemId) ?? {
        name: item.menuItem.name,
        qty: 0,
        total: 0,
      };
      existing.qty += item.qty;
      existing.total += item.price * item.qty;
      menuCount.set(item.menuItemId, existing);
    }
  }
  const topMenu = Array.from(menuCount.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return { orders, totalOmzet, totalTransaksi, rataRata, byMethod, chartData, topMenu };
}
