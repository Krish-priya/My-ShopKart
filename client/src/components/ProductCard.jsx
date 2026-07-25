import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  getDiscountPercent,
  getMrp,
  getProductRating,
  getReviewCount,
  renderStars,
} from "../utils/productMeta";
import HeartIcon from "./HeartIcon";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const outOfStock = Number(product.stock) <= 0;
  const rating = getProductRating(product);
  const reviews = getReviewCount(product);
  const mrp = getMrp(product);
  const discount = getDiscountPercent(product);
  const wished = user ? isWishlisted(product.id) : false;

  async function handleQuickAdd(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: `/products/${product.id}` } });
      return;
    }

    if (outOfStock) return;

    try {
      await addToCart(product.id, 1);
    } catch {
      // detail page shows fuller errors
    }
  }

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: `/products/${product.id}` } });
      return;
    }

    try {
      await toggleWishlist(product.id);
    } catch {
      // ignore toggle noise on cards
    }
  }

  return (
    <article className="product-card">
      <button
        type="button"
        className={`wish-toggle ${wished ? "active" : ""}`}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={handleWishlist}
      >
        <HeartIcon filled={wished} />
      </button>

      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-wrap">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
            }}
          />
          {outOfStock && <span className="stock-badge out">Out of stock</span>}
          {discount > 0 && !outOfStock && (
            <span className="deal-badge">{discount}% off</span>
          )}
        </div>
        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="rating-line">
            <span className="stars">{renderStars(rating)}</span>
            <span className="rating-score">{rating}</span>
            <span className="review-count">({reviews.toLocaleString("en-IN")})</span>
          </p>
          <p className="product-price-row">
            <span className="product-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <span className="product-mrp">₹{mrp.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </Link>
      <button
        type="button"
        className="btn btn-cart-card"
        onClick={handleQuickAdd}
        disabled={outOfStock}
      >
        {outOfStock ? "Unavailable" : "Add to bag"}
      </button>
    </article>
  );
}
