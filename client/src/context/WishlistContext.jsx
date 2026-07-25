import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [productIds, setProductIds] = useState(() => new Set());
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("shopkart_token"))
  );

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
      const data = await apiRequest("/wishlist");
      applyWishlist(data);
    } catch {
      clearWishlistState();
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
    const data = await apiRequest("/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: Number(productId) }),
    });
    applyWishlist(data);
    return data;
  }

  async function removeFromWishlist(productId) {
    const data = await apiRequest(`/wishlist/${Number(productId)}`, {
      method: "DELETE",
    });
    applyWishlist(data);
    return data;
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
