import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api";

export default function CategoryBar() {
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    apiRequest("/products/categories")
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  const onProducts = location.pathname === "/products";
  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "";

  function chipClass(isActive) {
    return `category-chip${isActive ? " active" : ""}`;
  }

  return (
    <div className="category-bar">
      <div className="category-bar-inner">
        <Link
          to="/products"
          className={chipClass(onProducts && !activeCategory && !activeSort)}
        >
          All
        </Link>
        <Link
          to="/products?sort=price-asc"
          className={chipClass(onProducts && activeSort === "price-asc" && !activeCategory)}
        >
          Deals
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            to={`/products?category=${encodeURIComponent(category)}`}
            className={chipClass(onProducts && activeCategory === category)}
          >
            {category}
          </Link>
        ))}
        <Link
          to="/products?sort=newest"
          className={chipClass(onProducts && activeSort === "newest" && !activeCategory)}
        >
          New
        </Link>
      </div>
    </div>
  );
}
