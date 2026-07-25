import { handleDemoProducts } from "./data/demoCatalog";

// Local: Vite proxies /api → Express.
// Netlify/production: set VITE_API_URL to your backend URL (no trailing slash).
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

function getToken() {
  return localStorage.getItem("shopkart_token");
}

function tryDemoFallback(path, method) {
  if (method !== "GET") return null;
  if (!String(path).startsWith("/products")) return null;
  return handleDemoProducts(path);
}

function looksLikeApiPayload(path, data) {
  if (!data || typeof data !== "object") return false;
  if (path.startsWith("/products/categories")) return Array.isArray(data.categories);
  if (/^\/products\/\d+/.test(path.split("?")[0])) return Boolean(data.product);
  if (path.startsWith("/products")) return Array.isArray(data.products);
  return true;
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    const demo = tryDemoFallback(path, method);
    if (demo) return demo;
    throw new Error("Cannot connect to server. Is the backend running?");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok || !looksLikeApiPayload(path, data)) {
    const demo = tryDemoFallback(path, method);
    if (demo) return demo;
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
