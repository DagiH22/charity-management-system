/*
  Warnings:

  - You are about to alter the column `status` on the `campaign` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `campaign` MODIFY `status` ENUM('Active', 'Closed') NOT NULL DEFAULT 'Active';
