-- Run this on an EXISTING ShopKart database to add wishlist + online payment support.
-- Usage (MySQL): SOURCE path/to/migrate_wishlist_payment.sql;
-- Or: mysql -u root -p shopkart < server/sql/migrate_wishlist_payment.sql

USE shopkart;

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Expand payment methods (COD + UPI)
ALTER TABLE orders
  MODIFY COLUMN payment_method ENUM('COD', 'UPI') NOT NULL DEFAULT 'COD';

-- Add payment status if missing
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'shopkart'
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'payment_status'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE orders ADD COLUMN payment_status ENUM(''unpaid'', ''paid'') NOT NULL DEFAULT ''unpaid'' AFTER payment_method',
  'SELECT ''payment_status already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Existing COD orders stay unpaid; leave as-is
UPDATE orders SET payment_status = 'unpaid' WHERE payment_method = 'COD' AND payment_status IS NULL;
