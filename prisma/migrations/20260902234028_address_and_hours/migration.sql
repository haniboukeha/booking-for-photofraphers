-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "eventAddress" TEXT;

-- AlterTable
ALTER TABLE "BusinessSettings" ADD COLUMN     "closeTime" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "openTime" TEXT NOT NULL DEFAULT '09:00';
