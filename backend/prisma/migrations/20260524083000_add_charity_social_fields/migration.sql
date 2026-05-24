-- Add social profile fields to CharityProfile
ALTER TABLE `CharityProfile` ADD COLUMN `socialFacebook` VARCHAR(191) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `socialTelegram` VARCHAR(191) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `socialInstagram` VARCHAR(191) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `socialTwitter` VARCHAR(191) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `socialYoutube` VARCHAR(191) NULL;
ALTER TABLE `CharityProfile` ADD COLUMN `socialTiktok` VARCHAR(191) NULL;
