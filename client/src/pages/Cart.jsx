import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, total, loading, error, updateCartItem, removeCartItem, refreshCart } = useCart();
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function handleQuantityChange(id, quantity) {
    const nextQty = Number(quantity);
    if (!nextQty || nextQty < 1) return;

    setBusyId(id);
    setActionError("");
    try {
      await updateCartItem(id, nextQty);
    } catch (err) {
      setActionError(err.message);
      await refreshCart();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(id) {
    setBusyId(id);
    setActionError("");
    try {
      await removeCartItem(id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading && items.length === 0) {
    return <p className="page-message">Loading bag...</p>;
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>Your bag</h2>
        <p>Review items, then checkout with COD or UPI.</p>
      </div>

      {(error || actionError) && <p className="error-text">{error || actionError}</p>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your bag is empty.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <article key={item.id} className="cart-row">
                <img src={item.image_url} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>₹{Number(item.price).toLocaleString("en-IN")}</p>
                  <p className="stock-text">Stock: {item.stock}</p>
                </div>
                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    aria-label="Decrease quantity"
                    disabled={busyId === item.id || item.quantity <= 1}
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    disabled={busyId === item.id}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    aria-label="Increase quantity"
                    disabled={busyId === item.id || item.quantity >= item.stock}
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="line-total">
                  ₹{Number(item.line_total).toLocaleString("en-IN")}
                </p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busyId === item.id}
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <p>
              Total: <strong>₹{Number(total).toLocaleString("en-IN")}</strong>
            </p>
            <Link to="/checkout" className="btn btn-primary">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
