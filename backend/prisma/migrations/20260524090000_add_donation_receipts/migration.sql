-- CreateTable DonationReceipt
CREATE TABLE `DonationReceipt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donationId` INTEGER NOT NULL,
    `receiptReference` VARCHAR(191) NOT NULL,
    `issuedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DonationReceipt_donationId_key`(`donationId`),
    UNIQUE INDEX `DonationReceipt_receiptReference_key`(`receiptReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key for DonationReceipt
ALTER TABLE `DonationReceipt` ADD CONSTRAINT `DonationReceipt_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `Donation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
