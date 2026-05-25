-- CreateTable
CREATE TABLE `CampaignRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `charityId` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedById` INTEGER NULL,
    `consumedAt` DATETIME(3) NULL,
    `consumedCampaignId` INTEGER NULL,
    `monthCampaignCount` INTEGER NOT NULL,
    `totalCampaignCount` INTEGER NOT NULL,
    `activeCampaignCount` INTEGER NOT NULL,

    UNIQUE INDEX `CampaignRequest_consumedCampaignId_key`(`consumedCampaignId`),
    INDEX `CampaignRequest_charityId_status_requestedAt_idx`(`charityId`, `status`, `requestedAt`),
    INDEX `CampaignRequest_status_requestedAt_idx`(`status`, `requestedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CampaignRequest` ADD CONSTRAINT `CampaignRequest_charityId_fkey` FOREIGN KEY (`charityId`) REFERENCES `CharityProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CampaignRequest` ADD CONSTRAINT `CampaignRequest_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CampaignRequest` ADD CONSTRAINT `CampaignRequest_consumedCampaignId_fkey` FOREIGN KEY (`consumedCampaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
