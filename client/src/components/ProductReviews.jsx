import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import { renderStars } from "../utils/productMeta";

export default function ProductReviews({ productId, onSummaryChange }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [eligibility, setEligibility] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await apiRequest(`/reviews/product/${productId}`);
      setReviews(data.reviews || []);
      setAvgRating(data.avg_rating || 0);
      setReviewCount(data.review_count || 0);
      onSummaryChange?.({
        avg_rating: data.avg_rating || 0,
        review_count: data.review_count || 0,
      });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (!user) {
      setEligibility(null);
      return;
    }
    apiRequest(`/reviews/product/${productId}/eligibility`)
      .then(setEligibility)
      .catch(() => setEligibility(null));
  }, [user, productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest(`/reviews/product/${productId}`, {
        method: "POST",
        body: JSON.stringify({ rating: Number(rating), comment }),
      });
      setSuccess("Thanks for your review!");
      setComment("");
      setRating(5);
      await loadReviews();
      const next = await apiRequest(`/reviews/product/${productId}/eligibility`);
      setEligibility(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section reviews-section">
      <div className="section-heading">
        <h2>Customer reviews</h2>
        <p>
          {reviewCount > 0
            ? `${avgRating} average from ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
            : "No reviews yet — be the first after purchase."}
        </p>
      </div>

      {loading && <p className="page-message">Loading reviews...</p>}
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      {!user && (
        <p className="pay-note">
          <Link to="/login">Sign in</Link> to leave a review after purchasing.
        </p>
      )}

      {user && eligibility?.canReview && (
        <form className="form-card review-form" onSubmit={handleSubmit}>
          <h3>Write a review</h3>
          <label>
            Rating
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
          <label>
            Comment (optional)
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike?"
              maxLength={1000}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {user && eligibility && !eligibility.canReview && (
        <p className="pay-note">
          {eligibility.alreadyReviewed
            ? "You already reviewed this product."
            : eligibility.hasPurchased
              ? "You cannot review this product right now."
              : "Buy this product to unlock reviewing."}
        </p>
      )}

      <div className="reviews-list">
        {reviews.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-head">
              <strong>{review.user_name}</strong>
              <span className="stars">{renderStars(Number(review.rating))}</span>
            </div>
            {review.comment && <p>{review.comment}</p>}
            <small>{new Date(review.created_at).toLocaleDateString()}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
