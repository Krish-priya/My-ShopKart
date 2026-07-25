import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("shopkart_token"))
  );
  const [error, setError] = useState("");

  function applyCart(data) {
    setItems(data.items || []);
    setTotal(Number(data.total) || 0);
    setItemCount(Number(data.itemCount) || 0);
  }

  function clearCartState() {
    setItems([]);
    setTotal(0);
    setItemCount(0);
    setError("");
  }

  async function refreshCart() {
    if (!user) {
      clearCartState();
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/cart");
      applyCart(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      clearCartState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function addToCart(productId, quantity = 1) {
    const data = await apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    applyCart(data);
    return data;
  }

  async function updateCartItem(cartItemId, quantity) {
    const data = await apiRequest(`/cart/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: Number(quantity) }),
    });
    applyCart(data);
    return data;
  }

  async function removeCartItem(cartItemId) {
    const data = await apiRequest(`/cart/${cartItemId}`, {
      method: "DELETE",
    });
    applyCart(data);
    return data;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount,
        loading,
        error,
        refreshCart,
        clearCartState,
        addToCart,
        updateCartItem,
        removeCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
