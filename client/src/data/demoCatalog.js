/** Demo catalog used on Netlify when the Express/MySQL backend is offline. */
export const DEMO_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description: "Comfortable over-ear headphones with clear sound and long battery life.",
    price: 2499,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    category: "Electronics",
    stock: 40,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Track steps, heart rate, and sleep with a bright touchscreen display.",
    price: 3999,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "Electronics",
    stock: 35,
  },
  {
    id: 3,
    name: "Classic Cotton T-Shirt",
    description: "Soft everyday cotton tee available in a clean everyday style.",
    price: 599,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: "Fashion",
    stock: 100,
  },
  {
    id: 4,
    name: "Denim Jeans",
    description: "Durable mid-rise jeans with a comfortable regular fit.",
    price: 1499,
    image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    category: "Fashion",
    stock: 60,
  },
  {
    id: 5,
    name: "Running Shoes",
    description: "Lightweight shoes designed for daily runs and casual wear.",
    price: 2799,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    category: "Footwear",
    stock: 45,
  },
  {
    id: 6,
    name: "Leather Wallet",
    description: "Slim bifold wallet with multiple card slots and cash pocket.",
    price: 899,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758446bfb?w=500",
    category: "Accessories",
    stock: 70,
  },
  {
    id: 7,
    name: "Stainless Steel Water Bottle",
    description: "Keeps drinks cold or hot for hours. Leak-proof lid included.",
    price: 749,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
    category: "Home",
    stock: 80,
  },
  {
    id: 8,
    name: "Ceramic Coffee Mug",
    description: "Microwave-safe mug perfect for tea, coffee, or hot chocolate.",
    price: 399,
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
    category: "Home",
    stock: 90,
  },
  {
    id: 9,
    name: "USB-C Fast Charger",
    description: "30W wall charger compatible with phones, tablets, and more.",
    price: 1299,
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500",
    category: "Electronics",
    stock: 55,
  },
  {
    id: 10,
    name: "Backpack 25L",
    description: "Everyday backpack with laptop sleeve and water bottle pocket.",
    price: 1899,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    category: "Accessories",
    stock: 50,
  },
  {
    id: 11,
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with warm and cool light modes.",
    price: 1599,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
    category: "Home",
    stock: 30,
  },
  {
    id: 12,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with silent clicks and long battery life.",
    price: 999,
    image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    category: "Electronics",
    stock: 65,
  },
];

function sortProducts(list, sort) {
  const items = [...list];
  switch (sort) {
    case "price-asc":
      return items.sort((a, b) => a.price - b.price);
    case "price-desc":
      return items.sort((a, b) => b.price - a.price);
    case "name-asc":
      return items.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return items.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
    default:
      return items.sort((a, b) => b.id - a.id);
  }
}

/** Handle GET /products* when live API is unavailable. */
export function handleDemoProducts(path) {
  const [pathname, queryString = ""] = path.split("?");
  const params = new URLSearchParams(queryString);

  if (pathname === "/products/categories") {
    const categories = [...new Set(DEMO_PRODUCTS.map((p) => p.category))];
    return { categories };
  }

  const detailMatch = pathname.match(/^\/products\/(\d+)$/);
  if (detailMatch) {
    const product = DEMO_PRODUCTS.find((p) => p.id === Number(detailMatch[1]));
    if (!product) {
      throw new Error("Product not found");
    }
    return { product };
  }

  if (pathname === "/products") {
    let list = [...DEMO_PRODUCTS];
    const category = params.get("category");
    const search = (params.get("search") || "").trim().toLowerCase();
    const sort = params.get("sort") || "newest";
    const limit = Number(params.get("limit"));

    if (category && category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (search) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    list = sortProducts(list, sort);
    if (Number.isFinite(limit) && limit > 0) {
      list = list.slice(0, limit);
    }

    return { products: list };
  }

  return null;
}
