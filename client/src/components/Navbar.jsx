import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import CategoryBar from "./CategoryBar";
import HeartIcon from "./HeartIcon";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchWrapRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", menuOpen);
    return () => document.body.classList.remove("nav-drawer-open");
  }, [menuOpen]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setSuggestLoading(false);
      return undefined;
    }

    setSuggestLoading(true);
    const timer = setTimeout(() => {
      apiRequest(`/products?search=${encodeURIComponent(q)}&limit=5`)
        .then((data) => {
          setSuggestions(data.products || []);
          setShowSuggestions(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  function handleLogout() {
    setMenuOpen(false);
    navigate("/", { replace: true });
    setTimeout(() => {
      logout();
    }, 0);
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = search.trim();
    setShowSuggestions(false);
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setMenuOpen(false);
  }

  function goToProduct(product) {
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
    setMenuOpen(false);
    navigate(`/products/${product.id}`);
  }

  function goToAllResults() {
    const q = search.trim();
    setShowSuggestions(false);
    setMenuOpen(false);
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="navbar" id="top" tabIndex={-1}>
      <div className="navbar-top">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <img
              src="https://cdn-icons-png.flaticon.com/128/14063/14063185.png"
              alt="ShopKart"
              className="brand-logo"
            />
            <span className="brand-text">ShopKart</span>
          </Link>

          <div className="nav-search-wrap" ref={searchWrapRef}>
            <form className="nav-search" onSubmit={handleSearch} autoComplete="off">
              <input
                type="search"
                placeholder="Search styles, gadgets, home..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                  if (search.trim()) setShowSuggestions(true);
                }}
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
              />
              <button type="submit" className="nav-search-btn" aria-label="Search">
                Search
              </button>
            </form>

            {showSuggestions && search.trim() && (
              <div className="search-suggestions" role="listbox">
                {suggestLoading && <p className="suggestion-status">Searching...</p>}

                {!suggestLoading && suggestions.length === 0 && (
                  <p className="suggestion-status">No products found</p>
                )}

                {!suggestLoading &&
                  suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="suggestion-item"
                      role="option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goToProduct(product)}
                    >
                      <img src={product.image_url} alt="" className="suggestion-thumb" />
                      <span className="suggestion-text">
                        <span className="suggestion-name">{product.name}</span>
                        <span className="suggestion-meta">
                          {product.category} · ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                      </span>
                    </button>
                  ))}

                {!suggestLoading && (
                  <button
                    type="button"
                    className="suggestion-all"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={goToAllResults}
                  >
                    See all results for &ldquo;{search.trim()}&rdquo;
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`menu-toggle${menuOpen ? " open" : ""}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <button
              type="button"
              className="nav-drawer-backdrop"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
          )}

          <div className={`nav-right ${menuOpen ? "open" : ""}`}>
            <div className="nav-drawer-head">
              <p className="nav-drawer-title">Menu</p>
              <button
                type="button"
                className="nav-drawer-close"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="nav-links">
              <NavLink to="/" end>
                Home
              </NavLink>
              <NavLink to="/products">Shop</NavLink>
              {user && <NavLink to="/orders">Orders</NavLink>}
              {user && <NavLink to="/profile">Profile</NavLink>}
              {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
            </nav>

            <div className="nav-actions">
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
                title={theme === "light" ? "Dark mode" : "Light mode"}
              >
                {theme === "light" ? "🌙" : "☀️"}
                <span className="theme-toggle-label">
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </span>
              </button>

              {user ? (
                <>
                  <Link to="/profile" className="nav-account">
                    <span className="nav-hello">Hi, {user.name.split(" ")[0]}</span>
                    <span className="nav-account-label">Profile</span>
                  </Link>
                  <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-account">
                    <span className="nav-hello">Welcome</span>
                    <span className="nav-account-label">Sign in</span>
                  </Link>
                  <Link to="/signup" className="btn btn-primary">
                    Sign up
                  </Link>
                </>
              )}

              <div className="nav-icon-row">
                <NavLink
                  to={user ? "/wishlist" : "/login"}
                  className={({ isActive }) =>
                    `icon-link wish-link${user && isActive ? " active" : ""}`
                  }
                  state={!user ? { from: "/wishlist" } : undefined}
                  aria-label="Wishlist"
                >
                  <HeartIcon filled={wishCount > 0} />
                  <span className="icon-count">{wishCount}</span>
                </NavLink>

                <NavLink
                  to={user ? "/cart" : "/login"}
                  className={({ isActive }) =>
                    `icon-link cart-link${user && isActive ? " active" : ""}`
                  }
                  state={!user ? { from: "/cart" } : undefined}
                  aria-label="Cart"
                >
                  <span className="icon-bag" aria-hidden="true">
                    Bag
                  </span>
                  <span className="icon-count">{itemCount}</span>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CategoryBar />
    </header>
  );
}
