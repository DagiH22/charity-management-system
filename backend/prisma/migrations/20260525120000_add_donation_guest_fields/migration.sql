-- Add guest fields to Donation
ALTER TABLE `Donation` ADD COLUMN `guestEmail` VARCHAR(150) NULL;
ALTER TABLE `Donation` ADD COLUMN `guestName` VARCHAR(150) NULL;
-- Make donorId optional for guest donations
ALTER TABLE `Donation` MODIFY COLUMN `donorId` INTEGER NULL;

