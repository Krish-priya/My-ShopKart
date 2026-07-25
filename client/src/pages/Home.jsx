import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/products?sort=newest&limit=8"),
      apiRequest("/products?sort=price-asc&limit=4"),
      apiRequest("/products/categories"),
    ])
      .then(([featuredData, dealsData, categoriesData]) => {
        setFeatured(featuredData.products);
        setDeals(dealsData.products);
        setCategories(categoriesData.categories);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-brand">ShopKart</p>
          <h1>Find it. Love it. Get it.</h1>
          <p className="hero-text">
            A cleaner storefront for everyday finds — electronics, fashion, home, and
            more. Pay with COD or UPI at checkout.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Start shopping
            </Link>
            <Link to="/products?sort=price-asc" className="btn btn-hero-secondary">
              View deals
            </Link>
          </div>
        </div>
      </section>

      <section className="highlight-row">
        <div>
          <strong>Flexible pay</strong>
          <span>COD or UPI checkout</span>
        </div>
        <div>
          <strong>Wishlist</strong>
          <span>Save favorites anytime</span>
        </div>
        <div>
          <strong>Secure login</strong>
          <span>Protected account routes</span>
        </div>
        <div>
          <strong>Curated picks</strong>
          <span>Categories you actually use</span>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <h2>Shop by vibe</h2>
            <p>Jump into a category and explore.</p>
          </div>
          <div className="category-tiles">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="category-tile"
              >
                <span>{category}</span>
                <small>Explore →</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-heading row-between">
          <div>
            <h2>Value picks</h2>
            <p>Lower-priced finds worth a look.</p>
          </div>
          <Link to="/products?sort=price-asc" className="btn btn-ghost">
            See more
          </Link>
        </div>

        {loading && <p className="page-message">Loading picks...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading row-between">
          <div>
            <h2>Fresh on ShopKart</h2>
            <p>Newest additions from the catalog.</p>
          </div>
          <Link to="/products" className="btn btn-ghost">
            View all
          </Link>
        </div>

        {!loading && !error && (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
