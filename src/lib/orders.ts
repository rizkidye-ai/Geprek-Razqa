import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function generateOrderNumber(): Promise<string> {
  const today = format(new Date(), "yyyyMMdd");
  const prefix = `ORD-${today}-`;
  const countToday = await prisma.order.count({
    where: { orderNumber: { startsWith: prefix } },
  });
  const seq = String(countToday + 1).padStart(3, "0");
  return `${prefix}${seq}`;
}
