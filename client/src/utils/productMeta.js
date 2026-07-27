// Display helpers for catalog cards / detail

export function getProductRating(product) {
  if (product && Object.prototype.hasOwnProperty.call(product, "avg_rating")) {
    const value = Number(product.avg_rating) || 0;
    return Number(value.toFixed(1));
  }
  const id = Number(product?.id) || 1;
  const rating = 3.6 + ((id * 17) % 14) / 10;
  return Math.min(4.9, Number(rating.toFixed(1)));
}

export function getReviewCount(product) {
  if (product && Object.prototype.hasOwnProperty.call(product, "review_count")) {
    return Number(product.review_count) || 0;
  }
  const id = Number(product?.id) || 1;
  return 40 + ((id * 97) % 2200);
}

export function getMrp(product) {
  const price = Number(product?.price) || 0;
  const id = Number(product?.id) || 1;
  const bump = 1.12 + ((id % 5) * 0.03);
  return Math.round(price * bump);
}

export function getDiscountPercent(product) {
  const price = Number(product?.price) || 0;
  const mrp = getMrp(product);
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function renderStars(rating) {
  if (!rating) return "☆☆☆☆☆";
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let stars = "★".repeat(full);
  if (half) stars += "☆";
  stars = stars.padEnd(5, "☆");
  return stars;
}
