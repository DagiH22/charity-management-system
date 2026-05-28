/*
  Warnings:

  - You are about to alter the column `targetAmount` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - You are about to alter the column `currentAmount` on the `Campaign` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE `Campaign` ADD COLUMN `category` ENUM('HEALTH', 'EDUCATION', 'DISASTER_RELIEF', 'FOOD_SUPPORT', 'CHILDREN', 'ELDERLY', 'ENVIRONMENT', 'ANIMAL_WELFARE', 'COMMUNITY', 'RELIGIOUS', 'EMERGENCY', 'OTHER') NOT NULL DEFAULT 'OTHER',
    MODIFY `description` TEXT NOT NULL,
    MODIFY `targetAmount` DECIMAL(12, 2) NOT NULL,
    MODIFY `currentAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
