import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiRequest } from "../api";

function paymentLabel(method) {
  if (method === "RAZORPAY") return "Razorpay (Online · TEST)";
  if (method === "UPI") return "UPI / GPay / PhonePe (legacy)";
  return "Cash on Delivery (COD)";
}

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const successMessage = location.state?.success;

  useEffect(() => {
    setLoading(true);
    apiRequest(`/orders/${id}`)
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
        setError("");
      })
      .catch((err) => {
        setOrder(null);
        setItems([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="page-message">Loading order...</p>;
  }

  if (error || !order) {
    return (
      <section className="section">
        <p className="error-text">{error || "Order not found"}</p>
        <Link to="/orders" className="btn btn-secondary">
          Back to orders
        </Link>
      </section>
    );
  }

  const isPaid = order.payment_status === "paid";

  return (
    <section className="section">
      <div className="section-heading">
        <Link to="/orders" className="back-link">
          ← Back to orders
        </Link>
        <h2>Order #{order.id}</h2>
        <p>Placed on {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {successMessage && <p className="success-text">{successMessage}</p>}

      <div className="order-detail-grid">
        <div className="form-card">
          <h3>Items</h3>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={item.id || `${item.product_id}-${item.name}`} className="checkout-item">
                <img src={item.image_url} alt={item.name} />
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    Qty {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                </div>
                <span>₹{Number(item.line_total).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>{isPaid ? "Amount paid" : "Amount due on delivery"}</span>
            <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="form-card">
          <h3>Delivery & payment</h3>
          <p>
            <strong>Order status:</strong>{" "}
            <span className="status-badge">{order.status}</span>
          </p>
          <p>
            <strong>Payment method:</strong> {paymentLabel(order.payment_method)}
          </p>
          <p>
            <strong>Payment status:</strong>{" "}
            <span className={`pay-status ${order.payment_status}`}>
              {order.payment_status}
            </span>
          </p>
          {order.razorpay_payment_id && (
            <p>
              <strong>Razorpay payment id:</strong> {order.razorpay_payment_id}
            </p>
          )}
          <p>
            <strong>Phone:</strong> {order.phone}
          </p>
          <p>
            <strong>Address:</strong>
            <br />
            {order.shipping_address}
          </p>
        </div>
      </div>
    </section>
  );
}
