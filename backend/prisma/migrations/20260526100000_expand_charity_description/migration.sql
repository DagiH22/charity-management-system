-- Expand CharityProfile.description to support longer text
ALTER TABLE `CharityProfile`
  MODIFY COLUMN `description` TEXT NOT NULL;
