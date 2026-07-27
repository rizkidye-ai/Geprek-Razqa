import { Prisma } from "@prisma/client";

/** True when a Prisma delete/update failed because the row was already gone (e.g. a double-click). */
export function isNotFoundError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}
