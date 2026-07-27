-- CreateEnum
CREATE TYPE "ExpenseFrequency" AS ENUM ('HARIAN', 'BULANAN');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "frequency" "ExpenseFrequency" NOT NULL DEFAULT 'HARIAN';
