-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "stackable" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "optionsJson" JSONB;
