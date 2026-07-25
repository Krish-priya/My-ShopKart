// Display helpers (no DB change) — makes catalog feel more like Amazon

export function getProductRating(product) {
  const id = Number(product?.id) || 1;
  const rating = 3.6 + ((id * 17) % 14) / 10; // 3.6 – 4.9
  return Math.min(4.9, Number(rating.toFixed(1)));
}

export function getReviewCount(product) {
  const id = Number(product?.id) || 1;
  return 40 + ((id * 97) % 2200);
}

export function getMrp(product) {
  const price = Number(product?.price) || 0;
  const id = Number(product?.id) || 1;
  const bump = 1.12 + ((id % 5) * 0.03); // 12%–24% higher
  return Math.round(price * bump);
}

export function getDiscountPercent(product) {
  const price = Number(product?.price) || 0;
  const mrp = getMrp(product);
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let stars = "★".repeat(full);
  if (half) stars += "☆";
  stars = stars.padEnd(5, "☆");
  return stars;
}
