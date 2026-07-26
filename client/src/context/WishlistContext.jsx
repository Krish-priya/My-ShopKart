import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";
import { DEMO_PRODUCTS } from "../data/demoCatalog";
import { shouldUseLocalAuth } from "../localAuth";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

function wishlistKey(userId) {
  return `shopkart_wishlist_${userId}`;
}

function loadLocalIds(userId) {
  try {
    const raw = localStorage.getItem(wishlistKey(userId));
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveLocalIds(userId, ids) {
  localStorage.setItem(wishlistKey(userId), JSON.stringify(ids));
}

function buildLocalWishlist(userId) {
  const productIds = loadLocalIds(userId);
  const items = productIds.map((productId, index) => {
    const product = DEMO_PRODUCTS.find((p) => Number(p.id) === Number(productId));
    return {
      id: index + 1,
      product_id: productId,
      created_at: new Date().toISOString(),
      name: product?.name || `Product ${productId}`,
      price: product?.price ?? 0,
      image_url: product?.image_url || "",
      category: product?.category || "",
      stock: product?.stock ?? 0,
      description: product?.description || "",
    };
  });
  return { items, productIds, count: productIds.length };
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [productIds, setProductIds] = useState(() => new Set());
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("shopkart_token"))
  );
  const useLocal = shouldUseLocalAuth();

  function applyWishlist(data) {
    const nextItems = data.items || [];
    const ids = new Set(
      (data.productIds || nextItems.map((item) => item.product_id)).map(Number)
    );
    setItems(nextItems);
    setProductIds(ids);
    setCount(Number(data.count ?? ids.size) || 0);
  }

  function clearWishlistState() {
    setItems([]);
    setProductIds(new Set());
    setCount(0);
  }

  async function refreshWishlist() {
    if (!user) {
      clearWishlistState();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (useLocal) {
        applyWishlist(buildLocalWishlist(user.id));
      } else {
        const data = await apiRequest("/wishlist");
        applyWishlist(data);
      }
    } catch {
      if (user?.id) {
        applyWishlist(buildLocalWishlist(user.id));
      } else {
        clearWishlistState();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      refreshWishlist();
    } else {
      clearWishlistState();
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function isWishlisted(productId) {
    return productIds.has(Number(productId));
  }

  async function addToWishlist(productId) {
    const id = Number(productId);
    if (!user) {
      throw new Error("Please login first");
    }

    if (useLocal) {
      const ids = loadLocalIds(user.id);
      if (!ids.includes(id)) {
        ids.push(id);
        saveLocalIds(user.id, ids);
      }
      const data = buildLocalWishlist(user.id);
      applyWishlist(data);
      return { message: "Added to wishlist", ...data };
    }

    try {
      const data = await apiRequest("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: id }),
      });
      applyWishlist(data);
      return data;
    } catch {
      const ids = loadLocalIds(user.id);
      if (!ids.includes(id)) {
        ids.push(id);
        saveLocalIds(user.id, ids);
      }
      const data = buildLocalWishlist(user.id);
      applyWishlist(data);
      return { message: "Added to wishlist", ...data };
    }
  }

  async function removeFromWishlist(productId) {
    const id = Number(productId);
    if (!user) {
      throw new Error("Please login first");
    }

    if (useLocal) {
      const ids = loadLocalIds(user.id).filter((pid) => pid !== id);
      saveLocalIds(user.id, ids);
      const data = buildLocalWishlist(user.id);
      applyWishlist(data);
      return { message: "Removed from wishlist", ...data };
    }

    try {
      const data = await apiRequest(`/wishlist/${id}`, {
        method: "DELETE",
      });
      applyWishlist(data);
      return data;
    } catch {
      const ids = loadLocalIds(user.id).filter((pid) => pid !== id);
      saveLocalIds(user.id, ids);
      const data = buildLocalWishlist(user.id);
      applyWishlist(data);
      return { message: "Removed from wishlist", ...data };
    }
  }

  async function toggleWishlist(productId) {
    if (isWishlisted(productId)) {
      return removeFromWishlist(productId);
    }
    return addToWishlist(productId);
  }

  async function moveToCart(productId) {
    const data = await apiRequest(`/wishlist/${Number(productId)}/move-to-cart`, {
      method: "POST",
    });
    applyWishlist(data);
    return data;
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        count,
        loading,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      items: [],
      count: 0,
      loading: false,
      isWishlisted: () => false,
      addToWishlist: async () => {},
      removeFromWishlist: async () => {},
      toggleWishlist: async () => {},
      moveToCart: async () => {},
      refreshWishlist: async () => {},
    };
  }
  return ctx;
}
