import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="section narrow">
      <div className="section-heading">
        <h1>About the store</h1>
        <p>ShopKart is a modern storefront for everyday finds.</p>
      </div>
      <div className="form-card">
        <p>
          Browse electronics, fashion, home, and more. Save favorites to your
          wishlist, and check out with Cash on Delivery or UPI.
        </p>
        <p>
          Create an account to track orders, manage your profile, and keep your
          bag synced across visits.
        </p>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-primary">
            Browse catalog
          </Link>
          <Link to="/signup" className="btn btn-ghost">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
