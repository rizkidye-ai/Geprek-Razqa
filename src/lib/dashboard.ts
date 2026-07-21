import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function getDashboardData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    todayPayments,
    ordersToday,
    activeOrders,
    lowStockIngredients,
    topMenuRaw,
    weekSales,
  ] = await Promise.all([
    prisma.payment.findMany({
      where: { paidAt: { gte: todayStart, lte: todayEnd } },
      select: { amount: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.order.findMany({
      where: { status: { in: ["BARU", "DIPROSES", "SIAP"] } },
      select: { status: true },
    }),
    prisma.ingredient.findMany({
      where: {},
      orderBy: { stock: "asc" },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { qty: true },
      where: {
        order: { status: { not: "DIBATALKAN" } },
      },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: subDays(todayStart, 6) } },
      select: { amount: true, paidAt: true },
    }),
  ]);

  const totalOmzetHariIni = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const jumlahTransaksiHariIni = todayPayments.length;

  const statusCounts = { BARU: 0, DIPROSES: 0, SIAP: 0 };
  for (const o of activeOrders) {
    statusCounts[o.status as keyof typeof statusCounts]++;
  }

  const lowStock = lowStockIngredients.filter((i) => i.stock <= i.minStock);

  const menuIds = topMenuRaw.map((m) => m.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuIds } },
    select: { id: true, name: true, price: true },
  });
  const menuMap = new Map(menuItems.map((m) => [m.id, m]));
  const topMenu = topMenuRaw
    .map((m) => ({
      name: menuMap.get(m.menuItemId)?.name ?? "Menu",
      qty: m._sum.qty ?? 0,
    }))
    .filter((m) => m.qty > 0);

  const salesByDay = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const day = subDays(todayStart, i);
    salesByDay.set(format(day, "yyyy-MM-dd"), 0);
  }
  for (const p of weekSales) {
    const key = format(p.paidAt, "yyyy-MM-dd");
    if (salesByDay.has(key)) {
      salesByDay.set(key, (salesByDay.get(key) ?? 0) + p.amount);
    }
  }
  const chartData = Array.from(salesByDay.entries()).map(([date, total]) => ({
    date: format(new Date(date), "dd/MM"),
    total,
  }));

  return {
    totalOmzetHariIni,
    jumlahTransaksiHariIni,
    ordersToday,
    statusCounts,
    lowStock,
    topMenu,
    chartData,
  };
}
