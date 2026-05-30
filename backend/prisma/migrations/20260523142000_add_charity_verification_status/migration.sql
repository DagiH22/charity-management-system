-- Add status column for charity verification lifecycle
ALTER TABLE `CharityProfile`
  ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- Backfill existing approved charity profiles
UPDATE `CharityProfile` cp
INNER JOIN `User` u ON u.id = cp.userId
SET cp.`status` = 'APPROVED'
WHERE u.`isVerified` = true;
