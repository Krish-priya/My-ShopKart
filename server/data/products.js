/**
 * Shared catalog for setup + seed scripts (100 products).
 * Image URLs use Unsplash/Pexels with product-matching photos.
 */
const products = [
  {
    "name": "Wireless Bluetooth Headphones",
    "description": "Comfortable over-ear headphones with clear sound and long battery life.",
    "price": 2499,
    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 40
  },
  {
    "name": "Smart Fitness Watch",
    "description": "Track steps, heart rate, and sleep with a bright touchscreen display.",
    "price": 3999,
    "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 35
  },
  {
    "name": "USB-C Fast Charger",
    "description": "30W wall charger compatible with phones, tablets, and more.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 55
  },
  {
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with silent clicks and long battery life.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 65
  },
  {
    "name": "Mechanical Keyboard",
    "description": "Tactile keys with RGB lighting for work and gaming.",
    "price": 3499,
    "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 28
  },
  {
    "name": "True Wireless Earbuds",
    "description": "Compact earbuds with charging case and clear call quality.",
    "price": 2999,
    "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 48
  },
  {
    "name": "Portable Bluetooth Speaker",
    "description": "Waterproof speaker with rich bass for indoor and outdoor use.",
    "price": 2199,
    "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 42
  },
  {
    "name": "10000mAh Power Bank",
    "description": "Slim dual-port power bank for phones and earbuds on the go.",
    "price": 1499,
    "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 60
  },
  {
    "name": "HD Webcam",
    "description": "1080p webcam with built-in mic for calls and streaming.",
    "price": 2799,
    "image_url": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 33
  },
  {
    "name": "Aluminum Laptop Stand",
    "description": "Ergonomic laptop stand that improves posture and cooling.",
    "price": 1699,
    "image_url": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 44
  },
  {
    "name": "Classic Cotton T-Shirt",
    "description": "Soft everyday cotton tee in a clean everyday style.",
    "price": 599,
    "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 100
  },
  {
    "name": "Denim Jeans",
    "description": "Durable mid-rise jeans with a comfortable regular fit.",
    "price": 1499,
    "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 60
  },
  {
    "name": "Cozy Fleece Hoodie",
    "description": "Soft fleece hoodie with kangaroo pocket for daily wear.",
    "price": 1799,
    "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 55
  },
  {
    "name": "Summer Floral Dress",
    "description": "Light breezy dress with a flattering everyday silhouette.",
    "price": 1899,
    "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 40
  },
  {
    "name": "Casual Bomber Jacket",
    "description": "Lightweight bomber jacket for travel and weekend outings.",
    "price": 2499,
    "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 32
  },
  {
    "name": "Linen Shirt",
    "description": "Breathable linen shirt for warm days and smart-casual looks.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 50
  },
  {
    "name": "Knit Sweater",
    "description": "Soft knit sweater for cool evenings and layering.",
    "price": 1599,
    "image_url": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 46
  },
  {
    "name": "Formal Trousers",
    "description": "Tailored trousers suited for office and formal occasions.",
    "price": 1799,
    "image_url": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 38
  },
  {
    "name": "Running Shoes",
    "description": "Lightweight shoes designed for daily runs and casual wear.",
    "price": 2799,
    "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 45
  },
  {
    "name": "Everyday Sneakers",
    "description": "Clean white sneakers that pair with jeans or joggers.",
    "price": 2299,
    "image_url": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 52
  },
  {
    "name": "Comfort Sandals",
    "description": "Cushioned sandals for home, travel, and summer walks.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 70
  },
  {
    "name": "Leather Ankle Boots",
    "description": "Sturdy ankle boots with a versatile everyday finish.",
    "price": 3499,
    "image_url": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 28
  },
  {
    "name": "Slip-On Loafers",
    "description": "Easy slip-on loafers for office and casual wear.",
    "price": 1999,
    "image_url": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 36
  },
  {
    "name": "Hiking Boots",
    "description": "Rugged boots with grip sole for trails and outdoor walks.",
    "price": 3999,
    "image_url": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 30
  },
  {
    "name": "Formal Oxford Shoes",
    "description": "Classic leather oxfords for office and formal events.",
    "price": 3299,
    "image_url": "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 34
  },
  {
    "name": "Stainless Steel Water Bottle",
    "description": "Keeps drinks cold or hot for hours. Leak-proof lid included.",
    "price": 749,
    "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 80
  },
  {
    "name": "Ceramic Coffee Mug",
    "description": "Microwave-safe mug perfect for tea, coffee, or hot chocolate.",
    "price": 399,
    "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 90
  },
  {
    "name": "Desk Lamp LED",
    "description": "Adjustable LED desk lamp with warm and cool light modes.",
    "price": 1599,
    "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 30
  },
  {
    "name": "Throw Cushion Cover",
    "description": "Soft textured cushion cover to refresh your living space.",
    "price": 549,
    "image_url": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 75
  },
  {
    "name": "Indoor Plant Pot",
    "description": "Minimal ceramic pot for desk plants and balconies.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 58
  },
  {
    "name": "Scented Soy Candle",
    "description": "Long-burning soy candle with a soft calming fragrance.",
    "price": 799,
    "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 64
  },
  {
    "name": "Cotton Bed Sheet Set",
    "description": "Soft cotton sheet set for a comfortable night's sleep.",
    "price": 1499,
    "image_url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 42
  },
  {
    "name": "Wall Clock Modern",
    "description": "Minimal wall clock that suits living rooms and offices.",
    "price": 899,
    "image_url": "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 50
  },
  {
    "name": "Matte Lipstick",
    "description": "Long-wear matte lipstick with a smooth creamy finish.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 85
  },
  {
    "name": "Vitamin C Face Serum",
    "description": "Brightening serum for daily skincare routines.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 70
  },
  {
    "name": "Eau de Parfum",
    "description": "Fresh daytime fragrance in a travel-friendly bottle.",
    "price": 2499,
    "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 40
  },
  {
    "name": "Skincare Gift Set",
    "description": "Gentle cleanser and moisturizer duo for everyday glow.",
    "price": 1899,
    "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 45
  },
  {
    "name": "Round Hair Brush",
    "description": "Salon-style brush for smooth blowouts and styling.",
    "price": 499,
    "image_url": "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 90
  },
  {
    "name": "Makeup Mirror LED",
    "description": "Compact LED mirror for precise makeup application.",
    "price": 1199,
    "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 38
  },
  {
    "name": "Face Moisturizer",
    "description": "Lightweight daily moisturizer for soft hydrated skin.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 72
  },
  {
    "name": "Nail Polish Set",
    "description": "Vibrant nail polish colors for everyday and party looks.",
    "price": 799,
    "image_url": "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 66
  },
  {
    "name": "Leather Wallet",
    "description": "Slim bifold wallet with multiple card slots and cash pocket.",
    "price": 899,
    "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 70
  },
  {
    "name": "Backpack 25L",
    "description": "Everyday backpack with laptop sleeve and water bottle pocket.",
    "price": 1899,
    "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 50
  },
  {
    "name": "Classic Sunglasses",
    "description": "UV-protected sunglasses with a timeless everyday shape.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 62
  },
  {
    "name": "Leather Belt",
    "description": "Genuine leather belt with a simple polished buckle.",
    "price": 799,
    "image_url": "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800",
    "category": "Accessories",
    "stock": 68
  },
  {
    "name": "Cotton Baseball Cap",
    "description": "Adjustable everyday cap for sun and casual looks.",
    "price": 499,
    "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 80
  },
  {
    "name": "Analog Wrist Watch",
    "description": "Classic analog watch with a clean dial and leather strap.",
    "price": 2199,
    "image_url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 41
  },
  {
    "name": "Canvas Tote Bag",
    "description": "Spacious canvas tote for shopping, college, and travel.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 74
  },
  {
    "name": "Phone Case Clear",
    "description": "Slim protective clear case that shows your phone design.",
    "price": 399,
    "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 95
  },
  {
    "name": "Travel Neck Pillow",
    "description": "Soft memory-foam neck pillow for flights and long trips.",
    "price": 899,
    "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 57
  },
  {
    "name": "4K Action Camera",
    "description": "Waterproof action camera for travel, sports, and vlogging.",
    "price": 5999,
    "image_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 24
  },
  {
    "name": "Gaming Headset",
    "description": "Surround-sound headset with mic for gaming and calls.",
    "price": 3299,
    "image_url": "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 37
  },
  {
    "name": "Wireless Charging Pad",
    "description": "Fast wireless charger compatible with modern smartphones.",
    "price": 1499,
    "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 58
  },
  {
    "name": "USB Hub 4-Port",
    "description": "Compact USB hub to expand laptop ports for work and travel.",
    "price": 899,
    "image_url": "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 70
  },
  {
    "name": "Smart LED Bulb",
    "description": "App-controlled LED bulb with warm and cool lighting modes.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 85
  },
  {
    "name": "External SSD 1TB",
    "description": "Fast portable SSD for backups, editing, and file transfer.",
    "price": 7499,
    "image_url": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 29
  },
  {
    "name": "Ring Light 10 Inch",
    "description": "Dimmable ring light for makeup, streaming, and content creation.",
    "price": 1899,
    "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 40
  },
  {
    "name": "Tablet 10 Inch",
    "description": "Lightweight tablet for streaming, reading, and browsing.",
    "price": 12999,
    "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 22
  },
  {
    "name": "Cargo Pants",
    "description": "Relaxed-fit cargo pants with utility pockets for daily wear.",
    "price": 1699,
    "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 48
  },
  {
    "name": "Polo T-Shirt",
    "description": "Classic polo tee for smart-casual and weekend looks.",
    "price": 899,
    "image_url": "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 72
  },
  {
    "name": "Winter Scarf",
    "description": "Soft woven scarf to keep warm on chilly days.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 60
  },
  {
    "name": "Rain Jacket",
    "description": "Water-resistant jacket for monsoon commuting and travel.",
    "price": 2299,
    "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 35
  },
  {
    "name": "Athleisure Joggers",
    "description": "Stretch joggers for workouts, travel, and loungewear.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 55
  },
  {
    "name": "Women's Blazer",
    "description": "Structured blazer for office meetings and evening events.",
    "price": 2799,
    "image_url": "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 28
  },
  {
    "name": "Printed Kurta",
    "description": "Comfortable printed kurta for festive and casual occasions.",
    "price": 1199,
    "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 44
  },
  {
    "name": "Denim Jacket",
    "description": "Classic denim jacket that layers over tees and dresses.",
    "price": 2199,
    "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    "category": "Fashion",
    "stock": 39
  },
  {
    "name": "Basketball Shoes",
    "description": "High-grip court shoes with cushioned support for play.",
    "price": 3599,
    "image_url": "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 31
  },
  {
    "name": "Flip Flops",
    "description": "Lightweight flip flops for beach, pool, and home use.",
    "price": 399,
    "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 90
  },
  {
    "name": "Kids Sneakers",
    "description": "Comfortable kids sneakers with easy fasten for school days.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 50
  },
  {
    "name": "Canvas Shoes",
    "description": "Casual canvas shoes for everyday college and weekend wear.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 64
  },
  {
    "name": "Sports Socks Pack",
    "description": "Breathable sports socks pack for gym and daily wear.",
    "price": 449,
    "image_url": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 120
  },
  {
    "name": "Slippers Indoor",
    "description": "Soft indoor slippers for cozy evenings at home.",
    "price": 599,
    "image_url": "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 75
  },
  {
    "name": "Trail Running Shoes",
    "description": "Grip-focused trail shoes for outdoor runs and hikes.",
    "price": 4199,
    "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "category": "Footwear",
    "stock": 27
  },
  {
    "name": "Nonstick Frying Pan",
    "description": "Durable nonstick pan for everyday cooking with easy clean-up.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 46
  },
  {
    "name": "Kitchen Knife Set",
    "description": "Essential knife set for slicing, dicing, and meal prep.",
    "price": 2499,
    "image_url": "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 33
  },
  {
    "name": "Storage Organizer Box",
    "description": "Stackable organizer box for closets, desks, and shelves.",
    "price": 649,
    "image_url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 80
  },
  {
    "name": "Bath Towel Set",
    "description": "Soft absorbent towels for bathrooms and guest use.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 68
  },
  {
    "name": "Table Lamp Fabric",
    "description": "Warm fabric shade lamp for bedrooms and reading corners.",
    "price": 1499,
    "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 36
  },
  {
    "name": "Cutlery Set 24pc",
    "description": "Stainless steel cutlery set for everyday dining.",
    "price": 1799,
    "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 41
  },
  {
    "name": "Vacuum Flask 1L",
    "description": "Insulated flask that keeps drinks hot or cold for hours.",
    "price": 1199,
    "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 52
  },
  {
    "name": "Doormat Rubber",
    "description": "Non-slip doormat to keep entrances clean and dry.",
    "price": 499,
    "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    "category": "Home",
    "stock": 70
  },
  {
    "name": "Sunscreen SPF 50",
    "description": "Lightweight sunscreen for daily UV protection.",
    "price": 799,
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 88
  },
  {
    "name": "Hair Dryer",
    "description": "Compact hair dryer with cool-shot for quick styling.",
    "price": 1699,
    "image_url": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 34
  },
  {
    "name": "Makeup Brush Set",
    "description": "Soft brush set for foundation, eyes, and blending.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 56
  },
  {
    "name": "Body Lotion",
    "description": "Nourishing body lotion for soft smooth skin.",
    "price": 549,
    "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 77
  },
  {
    "name": "Face Wash Gel",
    "description": "Gentle face wash that cleans without drying the skin.",
    "price": 399,
    "image_url": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 92
  },
  {
    "name": "Hair Serum",
    "description": "Smoothing hair serum for frizz control and shine.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 61
  },
  {
    "name": "Compact Powder",
    "description": "Matte compact powder for touch-ups through the day.",
    "price": 599,
    "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 73
  },
  {
    "name": "Electric Toothbrush",
    "description": "Rechargeable electric toothbrush for thorough cleaning.",
    "price": 2499,
    "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    "category": "Beauty",
    "stock": 30
  },
  {
    "name": "Laptop Sleeve 15 Inch",
    "description": "Padded laptop sleeve to protect devices while traveling.",
    "price": 999,
    "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 48
  },
  {
    "name": "Umbrella Compact",
    "description": "Wind-resistant compact umbrella for sudden rain.",
    "price": 699,
    "image_url": "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 65
  },
  {
    "name": "Keychain Leather",
    "description": "Handmade leather keychain with sturdy metal ring.",
    "price": 299,
    "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 100
  },
  {
    "name": "Passport Holder",
    "description": "Travel passport holder with card slots and ticket pocket.",
    "price": 799,
    "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 54
  },
  {
    "name": "Sports Water Bottle",
    "description": "Squeeze sports bottle for gym, cycling, and outdoor runs.",
    "price": 549,
    "image_url": "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 82
  },
  {
    "name": "Wireless Earbuds Case",
    "description": "Protective hard case for true wireless earbuds.",
    "price": 399,
    "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 90
  },
  {
    "name": "Card Holder Slim",
    "description": "Minimal card holder for IDs and everyday cards.",
    "price": 499,
    "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 78
  },
  {
    "name": "Gym Duffel Bag",
    "description": "Spacious duffel bag with shoe compartment for workouts.",
    "price": 1599,
    "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 43
  },
  {
    "name": "Beanie Wool Cap",
    "description": "Warm knit beanie for winter mornings and travel.",
    "price": 449,
    "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 67
  },
  {
    "name": "Phone Tripod Mini",
    "description": "Flexible mini tripod for phone photos and video calls.",
    "price": 799,
    "image_url": "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80",
    "category": "Accessories",
    "stock": 51
  },
  {
    "name": "Bluetooth Tracker Tag",
    "description": "Find keys, bags, and wallets with a phone-linked tracker tag.",
    "price": 1299,
    "image_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80",
    "category": "Electronics",
    "stock": 62
  }
];

module.exports = { products };
