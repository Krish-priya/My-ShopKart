import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchWrapRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const category = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    apiRequest("/products/categories")
      .then((data) => setCategories(["All", ...data.categories]))
      .catch(() => setCategories(["All", "Electronics", "Fashion", "Footwear", "Accessories", "Home"]));
  }, []);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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
    const q = searchInput.trim();
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
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (search.trim()) params.set("search", search.trim());
    if (sort) params.set("sort", sort);

    const query = params.toString();

    apiRequest(`/products${query ? `?${query}` : ""}`)
      .then((data) => {
        if (cancelled) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setProducts([]);
        setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, search, sort]);

  const resultLabel = useMemo(() => {
    if (loading) return "Loading...";
    if (products.length === 1) return "1 product found";
    return `${products.length} products found`;
  }, [loading, products.length]);

  function updateParams(next) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "All" || (key === "sort" && value === "newest")) {
        if (key === "sort" && value === "newest") {
          params.delete("sort");
        } else if (key !== "sort") {
          params.delete(key);
        }
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setShowSuggestions(false);
    updateParams({ search: searchInput.trim() });
  }

  function goToSuggestion(product) {
    setShowSuggestions(false);
    setSearchInput("");
    navigate(`/products/${product.id}`);
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>All products</h2>
        <p>Search ShopKart, filter by department, and sort like a real store.</p>
      </div>

      <form className="products-toolbar" onSubmit={handleSearchSubmit} autoComplete="off">
        <div className="products-search-wrap" ref={searchWrapRef}>
          <input
            type="search"
            className="search-input"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => {
              if (searchInput.trim()) setShowSuggestions(true);
            }}
            aria-label="Search products"
          />
          {showSuggestions && searchInput.trim() && (
            <div className="search-suggestions products-suggestions" role="listbox">
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
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToSuggestion(product)}
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
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>

      <div className="filter-row">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-btn ${category === item ? "active" : ""}`}
            onClick={() => updateParams({ category: item })}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="results-count">{resultLabel}</p>

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <p>No products match your search.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSearchInput("");
              setSearchParams({});
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
