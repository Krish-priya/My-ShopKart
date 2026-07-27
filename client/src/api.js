import { handleDemoProducts } from "./data/demoCatalog";
import { handleLocalAuth, shouldUseLocalAuth } from "./localAuth";
import { handleLocalOrders } from "./localShop";

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

function withAuthHeaders(options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return { ...options, headers };
}

function tryLocalOrders(path, requestOptions) {
  if (!path.startsWith("/orders")) return null;
  return handleLocalOrders(path, requestOptions);
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const requestOptions = withAuthHeaders(options);

  // On Netlify (no backend URL), auth/orders run in the browser.
  if (path.startsWith("/auth/") && shouldUseLocalAuth()) {
    return handleLocalAuth(path, requestOptions);
  }
  if (path.startsWith("/orders") && shouldUseLocalAuth()) {
    return handleLocalOrders(path, requestOptions);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...requestOptions,
    });
  } catch {
    if (path.startsWith("/auth/")) {
      return handleLocalAuth(path, requestOptions);
    }
    const localOrder = tryLocalOrders(path, requestOptions);
    if (localOrder) return localOrder;
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
    if (path.startsWith("/auth/") && !isJson) {
      return handleLocalAuth(path, requestOptions);
    }
    if (path.startsWith("/orders") && !isJson) {
      return handleLocalOrders(path, requestOptions);
    }

    const demo = tryDemoFallback(path, method);
    if (demo) return demo;

    if (!isJson) {
      const hasRemoteApi = Boolean(import.meta.env.VITE_API_URL);
      if (import.meta.env.DEV) {
        throw new Error(
          "Cannot reach the ShopKart API. Start the backend: cd server && npm run dev"
        );
      }
      if (!hasRemoteApi) {
        throw new Error(
          "Live site has no backend yet. Use http://localhost:5173 for Razorpay, or set VITE_API_URL to your deployed API."
        );
      }
      throw new Error("Service is unavailable. Please try again.");
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
