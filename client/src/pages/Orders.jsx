import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../api";

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const successMessage = location.state?.success;

  useEffect(() => {
    apiRequest("/orders")
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="page-message">Loading orders...</p>;
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>My orders</h2>
        <p>Track COD and UPI orders in one place.</p>
      </div>

      {successMessage && <p className="success-text">{successMessage}</p>}
      {error && <p className="error-text">{error}</p>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>You have no orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-row">
              <div>
                <h3>Order #{order.id}</h3>
                <p>{new Date(order.created_at).toLocaleString()}</p>
                <p className="stock-text">
                  {order.item_count} item{Number(order.item_count) === 1 ? "" : "s"}
                </p>
              </div>
              <p>₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
              <p className="status-badge">{order.status}</p>
              <div className="pay-meta">
                <span>{order.payment_method}</span>
                <span className={`pay-status ${order.payment_status}`}>
                  {order.payment_status}
                </span>
              </div>
              <Link to={`/orders/${order.id}`} className="btn btn-ghost">
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
