import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { items, loading, removeFromWishlist, moveToCart, refreshWishlist } = useWishlist();
  const { refreshCart } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRemove(productId) {
    setBusyId(productId);
    setError("");
    try {
      await removeFromWishlist(productId);
      setMessage("Removed from wishlist");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleMoveToCart(productId) {
    setBusyId(productId);
    setError("");
    setMessage("");
    try {
      await moveToCart(productId);
      await refreshCart();
      setMessage("Moved to cart");
    } catch (err) {
      setError(err.message);
      await refreshWishlist();
    } finally {
      setBusyId(null);
    }
  }

  if (loading && items.length === 0) {
    return <p className="page-message">Loading wishlist...</p>;
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>Your wishlist</h2>
        <p>Save favorites, then move them to cart when you&apos;re ready.</p>
      </div>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your wishlist is empty.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => {
            const outOfStock = Number(item.stock) <= 0;
            return (
              <article key={item.id} className="wishlist-row">
                <Link to={`/products/${item.product_id}`} className="wishlist-product">
                  <img src={item.image_url} alt={item.name} />
                  <div>
                    <p className="product-category">{item.category}</p>
                    <h3>{item.name}</h3>
                    <p className="product-price">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <p className={`stock-text ${outOfStock ? "out" : ""}`}>
                      {outOfStock ? "Out of stock" : `${item.stock} in stock`}
                    </p>
                  </div>
                </Link>

                <div className="wishlist-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busyId === item.product_id || outOfStock}
                    onClick={() => handleMoveToCart(item.product_id)}
                  >
                    {busyId === item.product_id ? "Moving..." : "Move to cart"}
                  </button>
                  <Link
                    to={`/products/${item.product_id}`}
                    className="btn btn-secondary"
                  >
                    View product
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busyId === item.product_id}
                    onClick={() => handleRemove(item.product_id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
