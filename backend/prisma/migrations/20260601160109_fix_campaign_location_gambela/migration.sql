/*
  Warnings:

  - The values [GAMBEELA] on the enum `Campaign_location` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Campaign` MODIFY `location` ENUM('ETHIOPIA', 'INTERNATIONAL', 'ADDIS_ABABA', 'AFAR', 'AMHARA', 'BENISHANGUL_GUMUZ', 'CENTRAL_ETHIOPIA', 'DIRE_DAWA', 'GAMBELA', 'HARARI', 'OROMIA', 'SIDAMA', 'SOMALI', 'SOUTH_ETHIOPIA', 'SOUTH_WEST_ETHIOPIA_PEOPLES', 'TIGRAY') NOT NULL DEFAULT 'ETHIOPIA';
