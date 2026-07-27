-- Razorpay fields + reviews table
USE shopkart;

ALTER TABLE orders
  MODIFY COLUMN payment_method ENUM('COD', 'UPI', 'RAZORPAY') NOT NULL DEFAULT 'COD';

SET @col1 := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'shopkart' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'razorpay_order_id'
);
SET @sql1 := IF(
  @col1 = 0,
  'ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(100) NULL AFTER payment_status',
  'SELECT 1'
);
PREPARE s1 FROM @sql1; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @col2 := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'shopkart' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'razorpay_payment_id'
);
SET @sql2 := IF(
  @col2 = 0,
  'ALTER TABLE orders ADD COLUMN razorpay_payment_id VARCHAR(100) NULL AFTER razorpay_order_id',
  'SELECT 1'
);
PREPARE s2 FROM @sql2; EXECUTE s2; DEALLOCATE PREPARE s2;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product_review (user_id, product_id),
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
