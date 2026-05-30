-- Add missing columns to User table
ALTER TABLE `User` ADD COLUMN `bio` TEXT NULL;
ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `profileImage` VARCHAR(191) NULL;

-- Add missing columns to CharityProfile table
ALTER TABLE `CharityProfile` ADD COLUMN `logo` VARCHAR(191) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `verifiedAt` DATETIME(3) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

-- Add missing columns to Campaign table
ALTER TABLE `Campaign` ADD COLUMN `donorCount` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `Campaign` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- CreateTable BankAccount
CREATE TABLE `BankAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `accountHolder` VARCHAR(191) NOT NULL,
    `type` ENUM('PERSONAL', 'BUSINESS') NOT NULL DEFAULT 'PERSONAL',
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BankAccount_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key for BankAccount
ALTER TABLE `BankAccount` ADD CONSTRAINT `BankAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Ensure Campaign has index on charityId
ALTER TABLE `Campaign` ADD INDEX `Campaign_charityId_fkey` (`charityId`);
