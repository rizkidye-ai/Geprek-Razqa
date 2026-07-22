import { prisma } from "@/lib/prisma";

export type MenuHpp = {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  hpp: number;
  margin: number;
  marginPercent: number;
  isActive: boolean;
};

export async function getMenuItemsWithHpp(): Promise<MenuHpp[]> {
  const menuItems = await prisma.menuItem.findMany({
    include: { category: true, ingredients: { include: { ingredient: true } } },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  return menuItems.map((m) => {
    const hpp = m.ingredients.reduce(
      (sum, mi) => sum + mi.qtyPerPortion * mi.ingredient.costPerUnit,
      0
    );
    const margin = m.price - hpp;
    const marginPercent = m.price > 0 ? (margin / m.price) * 100 : 0;
    return {
      id: m.id,
      name: m.name,
      categoryName: m.category.name,
      price: m.price,
      hpp,
      margin,
      marginPercent,
      isActive: m.isActive,
    };
  });
}

export async function getHppMap(): Promise<Map<string, number>> {
  const items = await getMenuItemsWithHpp();
  return new Map(items.map((i) => [i.id, i.hpp]));
}

export async function getExpenseTotals(start: Date, end: Date) {
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
  });

  const capex = expenses.filter((e) => e.type === "CAPEX");
  const opex = expenses.filter((e) => e.type === "OPEX");

  const capexTotal = capex.reduce((sum, e) => sum + e.amount, 0);
  const opexTotal = opex.reduce((sum, e) => sum + e.amount, 0);

  return { expenses, capex, opex, capexTotal, opexTotal };
}

export async function getTotalCapexInvestment(): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { type: "CAPEX" },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getIncomeStatement(start: Date, end: Date) {
  const [orders, hppMap, opexResult] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { not: "DIBATALKAN" },
        payment: { paidAt: { gte: start, lte: end } },
      },
      include: { items: true, payment: true },
    }),
    getHppMap(),
    prisma.expense.aggregate({
      where: { type: "OPEX", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + (o.payment?.amount ?? 0), 0);

  let cogs = 0;
  const cogsByMenu = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      const unitHpp = hppMap.get(item.menuItemId) ?? 0;
      const lineCogs = unitHpp * item.qty;
      cogs += lineCogs;
      cogsByMenu.set(item.menuItemId, (cogsByMenu.get(item.menuItemId) ?? 0) + lineCogs);
    }
  }

  const grossProfit = revenue - cogs;
  const opex = opexResult._sum.amount ?? 0;
  const netProfit = grossProfit - opex;

  return {
    revenue,
    cogs,
    grossProfit,
    opex,
    netProfit,
    orderCount: orders.length,
    unitsSold: orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0),
  };
}

export async function getBepRoiAnalysis(start: Date, end: Date) {
  const [income, totalInvestment] = await Promise.all([
    getIncomeStatement(start, end),
    getTotalCapexInvestment(),
  ]);

  const periodDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const avgPrice = income.unitsSold > 0 ? income.revenue / income.unitsSold : 0;
  const avgVariableCost = income.unitsSold > 0 ? income.cogs / income.unitsSold : 0;
  const contributionMargin = avgPrice - avgVariableCost;
  const contributionMarginRatio = avgPrice > 0 ? contributionMargin / avgPrice : 0;

  const fixedCosts = income.opex;
  const bepUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : null;
  const bepRupiah = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : null;

  const monthlyNetProfit = (income.netProfit / periodDays) * 30;
  const roiPercent = totalInvestment > 0 ? (income.netProfit / totalInvestment) * 100 : null;
  const paybackMonths =
    totalInvestment > 0 && monthlyNetProfit > 0 ? totalInvestment / monthlyNetProfit : null;

  let verdict: "LAYAK" | "CUKUP_LAYAK" | "BELUM_LAYAK" = "BELUM_LAYAK";
  if (income.netProfit > 0 && paybackMonths !== null && paybackMonths <= 24) {
    verdict = "LAYAK";
  } else if (income.netProfit > 0) {
    verdict = "CUKUP_LAYAK";
  }

  return {
    ...income,
    periodDays,
    avgPrice,
    avgVariableCost,
    contributionMargin,
    contributionMarginRatio,
    fixedCosts,
    bepUnits,
    bepRupiah,
    totalInvestment,
    monthlyNetProfit,
    roiPercent,
    paybackMonths,
    verdict,
  };
}
