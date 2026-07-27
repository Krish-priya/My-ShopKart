/**
 * Browser cart + orders for Netlify (no Express/MySQL).
 */
import { DEMO_PRODUCTS } from "./data/demoCatalog";

function cartKey(userId) {
  return `shopkart_cart_${userId}`;
}

function ordersKey(userId) {
  return `shopkart_orders_${userId}`;
}

export function getLocalUserId() {
  const token = localStorage.getItem("shopkart_token") || "";
  if (!token.startsWith("sk.")) return null;
  try {
    const payload = JSON.parse(atob(token.slice(3)));
    return payload?.id ? Number(payload.id) : null;
  } catch {
    return null;
  }
}

function findProduct(productId) {
  return DEMO_PRODUCTS.find((p) => Number(p.id) === Number(productId)) || null;
}

function loadCartRows(userId) {
  try {
    const raw = localStorage.getItem(cartKey(userId));
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function saveCartRows(userId, rows) {
  localStorage.setItem(cartKey(userId), JSON.stringify(rows));
}

function buildCartPayload(userId) {
  const rows = loadCartRows(userId);
  const items = rows
    .map((row) => {
      const product = findProduct(row.product_id);
      if (!product) return null;
      const quantity = Number(row.quantity) || 1;
      const price = Number(product.price) || 0;
      return {
        id: Number(row.id),
        quantity,
        product_id: Number(row.product_id),
        name: product.name,
        price,
        image_url: product.image_url,
        stock: product.stock,
        line_total: quantity * price,
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  return { items, total, itemCount };
}

export function getLocalCart(userId) {
  return buildCartPayload(userId);
}

export function addLocalCart(userId, productId, quantity = 1) {
  const product = findProduct(productId);
  if (!product) throw new Error("Product not found");

  const qty = Number(quantity) || 1;
  if (qty < 1) throw new Error("Valid productId and quantity required");

  const rows = loadCartRows(userId);
  const index = rows.findIndex((r) => Number(r.product_id) === Number(productId));
  const currentQty = index >= 0 ? Number(rows[index].quantity) : 0;
  const nextQty = currentQty + qty;

  if (nextQty > product.stock) {
    throw new Error(`Only ${product.stock} left in stock for ${product.name}`);
  }

  if (index >= 0) {
    rows[index] = { ...rows[index], quantity: nextQty };
  } else {
    const nextId =
      rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
    rows.unshift({ id: nextId, product_id: Number(productId), quantity: qty });
  }

  saveCartRows(userId, rows);
  return { message: "Added to cart", ...buildCartPayload(userId) };
}

export function updateLocalCartItem(userId, cartItemId, quantity) {
  const qty = Number(quantity);
  if (!qty || qty < 1) throw new Error("Quantity must be at least 1");

  const rows = loadCartRows(userId);
  const index = rows.findIndex((r) => Number(r.id) === Number(cartItemId));
  if (index < 0) throw new Error("Cart item not found");

  const product = findProduct(rows[index].product_id);
  if (!product) throw new Error("Product not found");
  if (qty > product.stock) {
    throw new Error(`Only ${product.stock} left in stock for ${product.name}`);
  }

  rows[index] = { ...rows[index], quantity: qty };
  saveCartRows(userId, rows);
  return { message: "Cart updated", ...buildCartPayload(userId) };
}

export function removeLocalCartItem(userId, cartItemId) {
  const rows = loadCartRows(userId).filter(
    (r) => Number(r.id) !== Number(cartItemId)
  );
  saveCartRows(userId, rows);
  return { message: "Item removed", ...buildCartPayload(userId) };
}

export function clearLocalCart(userId) {
  saveCartRows(userId, []);
}

function loadOrders(userId) {
  try {
    const raw = localStorage.getItem(ordersKey(userId));
    const orders = raw ? JSON.parse(raw) : [];
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function saveOrders(userId, orders) {
  localStorage.setItem(ordersKey(userId), JSON.stringify(orders));
}

export function placeLocalOrder(userId, body = {}) {
  const shippingAddress = String(body.shippingAddress || "").trim();
  const phone = String(body.phone || "").trim();
  const paymentMethod = String(body.paymentMethod || "COD").toUpperCase();
  const paymentConfirmed = Boolean(body.paymentConfirmed);
  const razorpayPaymentId = body.razorpay_payment_id
    ? String(body.razorpay_payment_id)
    : null;

  if (!shippingAddress || shippingAddress.length < 8) {
    throw new Error("Please enter a full shipping address");
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    throw new Error("Please enter a valid 10-digit phone number");
  }
  if (!["COD", "UPI", "RAZORPAY"].includes(paymentMethod)) {
    throw new Error("Payment method must be COD or RAZORPAY");
  }
  if (paymentMethod === "UPI" && !paymentConfirmed) {
    throw new Error("Complete the UPI payment before placing the order");
  }
  if (paymentMethod === "RAZORPAY" && !razorpayPaymentId && !paymentConfirmed) {
    throw new Error("Complete the Razorpay payment before placing the order");
  }

  const cart = buildCartPayload(userId);
  if (cart.items.length === 0) throw new Error("Your cart is empty");

  for (const item of cart.items) {
    if (item.quantity > item.stock) {
      throw new Error(`Not enough stock for ${item.name}`);
    }
  }

  const isOnlinePaid =
    paymentMethod === "UPI" || paymentMethod === "RAZORPAY";
  const paymentStatus = isOnlinePaid ? "paid" : "unpaid";
  const orderStatus = isOnlinePaid ? "confirmed" : "pending";
  const orders = loadOrders(userId);
  const orderId =
    orders.reduce((max, o) => Math.max(max, Number(o.id) || 0), 0) + 1;

  const orderItems = cart.items.map((item, index) => ({
    id: index + 1,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
    image_url: item.image_url,
    line_total: item.line_total,
  }));

  const order = {
    id: orderId,
    total_amount: cart.total,
    status: orderStatus,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    razorpay_payment_id: razorpayPaymentId,
    shipping_address: shippingAddress,
    phone,
    created_at: new Date().toISOString(),
    item_count: cart.itemCount,
    items: orderItems,
  };

  orders.unshift(order);
  saveOrders(userId, orders);
  clearLocalCart(userId);

  const payLabel =
    paymentMethod === "RAZORPAY"
      ? "Razorpay (Paid · TEST)"
      : paymentMethod === "UPI"
        ? "UPI (Paid)"
        : "Cash on Delivery";
  return {
    message: `Order placed successfully — ${payLabel}`,
    orderId,
    totalAmount: cart.total,
    paymentMethod,
    paymentStatus,
    order: {
      id: order.id,
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      razorpay_payment_id: order.razorpay_payment_id,
      shipping_address: order.shipping_address,
      phone: order.phone,
      created_at: order.created_at,
    },
    items: orderItems,
  };
}

export function listLocalOrders(userId) {
  const orders = loadOrders(userId).map((order) => ({
    id: order.id,
    total_amount: order.total_amount,
    status: order.status,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    shipping_address: order.shipping_address,
    phone: order.phone,
    created_at: order.created_at,
    item_count: order.item_count ?? order.items?.length ?? 0,
  }));
  return { orders };
}

export function getLocalOrder(userId, orderId) {
  const order = loadOrders(userId).find((o) => Number(o.id) === Number(orderId));
  if (!order) throw new Error("Order not found");
  return {
    order: {
      id: order.id,
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      phone: order.phone,
      created_at: order.created_at,
    },
    items: order.items || [],
  };
}

export function handleLocalOrders(path, options = {}) {
  const userId = getLocalUserId();
  if (!userId) throw new Error("Please login first");

  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const pathname = path.split("?")[0];

  if (method === "POST" && pathname === "/orders") {
    return placeLocalOrder(userId, body);
  }

  if (method === "GET" && pathname === "/orders") {
    return listLocalOrders(userId);
  }

  const detail = pathname.match(/^\/orders\/(\d+)$/);
  if (method === "GET" && detail) {
    return getLocalOrder(userId, detail[1]);
  }

  throw new Error("Order route not found");
}
