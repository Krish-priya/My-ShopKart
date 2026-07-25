-- Seed 12 sample products for ShopKart
-- Tip: prefer `npm run db:setup` which also creates the admin user safely.
USE shopkart;

INSERT INTO products (name, description, price, image_url, category, stock) VALUES
(
  'Wireless Bluetooth Headphones',
  'Comfortable over-ear headphones with clear sound and long battery life.',
  2499.00,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  'Electronics',
  40
),
(
  'Smart Fitness Watch',
  'Track steps, heart rate, and sleep with a bright touchscreen display.',
  3999.00,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  'Electronics',
  35
),
(
  'Classic Cotton T-Shirt',
  'Soft everyday cotton tee available in a clean everyday style.',
  599.00,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  'Fashion',
  100
),
(
  'Denim Jeans',
  'Durable mid-rise jeans with a comfortable regular fit.',
  1499.00,
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
  'Fashion',
  60
),
(
  'Running Shoes',
  'Lightweight shoes designed for daily runs and casual wear.',
  2799.00,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  'Footwear',
  45
),
(
  'Leather Wallet',
  'Slim bifold wallet with multiple card slots and cash pocket.',
  899.00,
  'https://images.unsplash.com/photo-1627123424574-724758446bfb?w=500',
  'Accessories',
  70
),
(
  'Stainless Steel Water Bottle',
  'Keeps drinks cold or hot for hours. Leak-proof lid included.',
  749.00,
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
  'Home',
  80
),
(
  'Ceramic Coffee Mug',
  'Microwave-safe mug perfect for tea, coffee, or hot chocolate.',
  399.00,
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
  'Home',
  90
),
(
  'USB-C Fast Charger',
  '30W wall charger compatible with phones, tablets, and more.',
  1299.00,
  'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
  'Electronics',
  55
),
(
  'Backpack 25L',
  'Everyday backpack with laptop sleeve and water bottle pocket.',
  1899.00,
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
  'Accessories',
  50
),
(
  'Desk Lamp LED',
  'Adjustable LED desk lamp with warm and cool light modes.',
  1599.00,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
  'Home',
  30
),
(
  'Wireless Mouse',
  'Ergonomic wireless mouse with silent clicks and long battery life.',
  999.00,
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
  'Electronics',
  65
);
