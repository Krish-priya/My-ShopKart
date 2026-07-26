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
    throw new Error(
      import.meta.env.DEV
        ? "Cannot connect to server. Start it with: cd server && npm run dev"
        : "Cannot connect right now. Please try again."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : {};

  if (!isJson || !response.ok || !looksLikeApiPayload(path, data)) {
    const demo = tryDemoFallback(path, method);
    if (demo) return demo;

    if (!isJson) {
      throw new Error(
        import.meta.env.DEV
          ? "Cannot reach the ShopKart API. Start the backend: cd server && npm run dev"
          : "Authentication service is unavailable. Please try again."
      );
    }

    throw new Error(data.message || "Something went wrong");
  }

  if (
    (path === "/auth/login" || path === "/auth/signup") &&
    (!data.token || !data.user)
  ) {
    throw new Error("Login failed. Please try again.");
  }

  return data;
}
