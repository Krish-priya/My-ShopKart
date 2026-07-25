import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function scrollPageToTop() {
  const behavior = "smooth";
  try {
    window.scrollTo({ top: 0, left: 0, behavior });
  } catch {
    window.scrollTo(0, 0);
  }

  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
  }
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = 0;
  }

  const topEl = document.getElementById("top");
  if (topEl) {
    topEl.scrollIntoView({ behavior, block: "start" });
  }
}

export default function Footer() {
  const { user } = useAuth();

  function handleBackToTop(e) {
    e.preventDefault();
    scrollPageToTop();
  }

  return (
    <footer className="site-footer">
      <button type="button" className="footer-back-top" onClick={handleBackToTop}>
        Back to top
      </button>

      <div className="footer-columns">
        <div>
          <h4>ShopKart</h4>
          <Link to="/about">About the store</Link>
          <Link to="/products">Browse catalog</Link>
        </div>
        <div>
          <h4>Discover</h4>
          <Link to="/products?sort=newest">New arrivals</Link>
          <Link to="/products?sort=price-asc">Best value picks</Link>
          <Link to="/signup">Create an account</Link>
        </div>
        <div>
          <h4>Pay your way</h4>
          <p>Cash on Delivery</p>
          <p>UPI · GPay · PhonePe (demo)</p>
          <p>Secure checkout with JWT auth</p>
        </div>
        <div>
          <h4>Help</h4>
          <Link to={user ? "/orders" : "/login"}>Orders</Link>
          <Link to={user ? "/profile" : "/login"}>Profile</Link>
          <Link to={user ? "/wishlist" : "/login"}>Wishlist</Link>
          <Link to={user ? "/cart" : "/login"}>Bag</Link>
        </div>
      </div>

      <div className="footer-brand-bar">
        <Link to="/" className="brand footer-brand">
          <img
            src="https://cdn-icons-png.flaticon.com/128/14063/14063185.png"
            alt="ShopKart"
            className="brand-logo"
          />
          <span className="brand-text">ShopKart</span>
        </Link>
        <p>ShopKart · Find it. Love it. Get it.</p>
      </div>
    </footer>
  );
}
