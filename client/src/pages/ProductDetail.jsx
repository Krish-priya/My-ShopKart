import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import ProductReviews from "../components/ProductReviews";
import {
  getDiscountPercent,
  getMrp,
  getProductRating,
  getReviewCount,
  renderStars,
} from "../utils/productMeta";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMessage("");
    setError("");
    setQuantity(1);

    apiRequest(`/products/${id}`)
      .then((data) => {
        setProduct(data.product);
        setRelated(data.related || []);
      })
      .catch((err) => {
        setProduct(null);
        setRelated([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleReviewSummary({ avg_rating, review_count }) {
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            avg_rating,
            review_count,
          }
        : prev
    );
  }

  async function handleAddToCart(goToCheckout = false) {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    if (!product || product.stock <= 0) {
      setError("This product is out of stock");
      return;
    }

    const safeQty = Math.min(Math.max(Number(quantity) || 1, 1), product.stock);
    setQuantity(safeQty);
    setAdding(true);

    try {
      await addToCart(Number(id), safeQty);
      setMessage("Added to bag!");
      setError("");
      if (goToCheckout) {
        navigate("/checkout");
      }
    } catch (err) {
      setError(err.message);
      setMessage("");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    setWishBusy(true);
    try {
      const wished = isWishlisted(id);
      await toggleWishlist(id);
      setMessage(wished ? "Removed from wishlist" : "Saved to wishlist");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setWishBusy(false);
    }
  }

  if (loading) {
    return <p className="page-message">Loading product...</p>;
  }

  if (error && !product) {
    return (
      <section className="section">
        <p className="error-text">{error}</p>
        <Link to="/products" className="btn btn-secondary">
          Back to products
        </Link>
      </section>
    );
  }

  const outOfStock = Number(product.stock) <= 0;
  const rating = getProductRating(product);
  const reviews = getReviewCount(product);
  const mrp = getMrp(product);
  const discount = getDiscountPercent(product);
  const wished = user ? isWishlisted(product.id) : false;

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Shop</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <section className="section detail-layout">
        <div className="detail-image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
            }}
          />
        </div>

        <div className="detail-info">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="rating-line">
            <span className="stars">{renderStars(rating)}</span>
            <span className="rating-score">{rating} out of 5</span>
            <span className="review-count">
              {reviews.toLocaleString("en-IN")} ratings
            </span>
          </p>

          <div className="price-box">
            <p className="detail-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
            <p className="product-mrp">List ₹{mrp.toLocaleString("en-IN")}</p>
            {discount > 0 && <p className="discount-text">{discount}% off</p>}
          </div>

          <p className="detail-desc">{product.description}</p>

          <ul className="detail-bullets">
            <li>Pay with Cash on Delivery or Razorpay (TEST)</li>
            <li>{outOfStock ? "Currently unavailable" : `${product.stock} units in stock`}</li>
            <li>Ships after order confirmation</li>
          </ul>

          <div className="buy-box">
            <p className={`stock-text ${outOfStock ? "out" : ""}`}>
              {outOfStock ? "Out of stock" : "In stock"}
            </p>

            <div className="qty-row">
              <label htmlFor="qty">Quantity</label>
              <input
                id="qty"
                type="number"
                min="1"
                max={Math.max(product.stock, 1)}
                value={quantity}
                disabled={outOfStock}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="detail-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAddToCart(false)}
                disabled={outOfStock || adding}
              >
                {adding ? "Adding..." : outOfStock ? "Unavailable" : "Add to bag"}
              </button>
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => handleAddToCart(true)}
                disabled={outOfStock || adding}
              >
                Buy now
              </button>
              <button
                type="button"
                className={`btn btn-wish ${wished ? "active" : ""}`}
                onClick={handleWishlist}
                disabled={wishBusy}
              >
                {wishBusy ? "Saving..." : wished ? "♥ Saved" : "♡ Wishlist"}
              </button>
            </div>
          </div>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
      </section>

      <ProductReviews productId={id} onSummaryChange={handleReviewSummary} />

      {related.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>More like this</h2>
            <p>From the {product.category} collection.</p>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
