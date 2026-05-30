-- CreateTable
CREATE TABLE `Campaign` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `charityId` INTEGER NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `targetAmount` DECIMAL(65, 30) NOT NULL,
    `currentAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `status` ENUM('Pending', 'Active', 'Closed') NOT NULL DEFAULT 'Pending',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_charityId_fkey` FOREIGN KEY (`charityId`) REFERENCES `CharityProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
