-- Add profile fields to users table
-- Run: mysql -u root -p shopkart < server/sql/migrate_profile.sql
-- Or: npm run db:migrate:profile

USE shopkart;

SET @phone_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'shopkart' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
);

SET @sql_phone := IF(
  @phone_exists = 0,
  'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email',
  'SELECT ''phone already exists'' AS info'
);
PREPARE stmt FROM @sql_phone;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @addr_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'shopkart' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'address'
);

SET @sql_addr := IF(
  @addr_exists = 0,
  'ALTER TABLE users ADD COLUMN address TEXT NULL AFTER phone',
  'SELECT ''address already exists'' AS info'
);
PREPARE stmt2 FROM @sql_addr;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
