import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useCart } from "../context/CartContext";

const MOCK_UPI_ID = "shopkart@upi";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, loading, clearCartState } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [upiPaid, setUpiPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="page-message">Loading checkout...</p>;
  }

  if (items.length === 0 && !submitting) {
    return <Navigate to="/cart" replace />;
  }

  async function handleMockPay() {
    setPaying(true);
    setError("");
    // Simulate a short UPI/GPay/PhonePe confirmation delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setUpiPaid(true);
    setPaying(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const trimmedAddress = shippingAddress.trim();
    const trimmedPhone = phone.trim();

    if (trimmedAddress.length < 8) {
      setError("Please enter a full shipping address");
      setSubmitting(false);
      return;
    }

    if (!/^[0-9]{10}$/.test(trimmedPhone)) {
      setError("Please enter a valid 10-digit phone number");
      setSubmitting(false);
      return;
    }

    if (paymentMethod === "UPI" && !upiPaid) {
      setError("Complete the UPI payment first, then place your order");
      setSubmitting(false);
      return;
    }

    try {
      const data = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress: trimmedAddress,
          phone: trimmedPhone,
          paymentMethod,
          paymentConfirmed: paymentMethod === "UPI" ? upiPaid : false,
        }),
      });

      const payNote =
        data.paymentMethod === "UPI"
          ? "paid via UPI"
          : "Cash on Delivery";

      navigate(`/orders/${data.orderId}`, {
        state: {
          success: `Order #${data.orderId} placed — ${payNote}.`,
        },
        replace: true,
      });

      clearCartState();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <section className="section checkout-layout">
      <div>
        <div className="section-heading">
          <h2>Checkout</h2>
          <p>Choose COD or pay online with UPI (demo flow).</p>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Shipping address
            <textarea
              rows="4"
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="House no, street, city, pincode"
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
            />
          </label>

          <fieldset className="pay-methods">
            <legend>Payment method</legend>

            <label className={`pay-option ${paymentMethod === "COD" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => {
                  setPaymentMethod("COD");
                  setUpiPaid(false);
                }}
              />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when the order arrives</small>
              </span>
            </label>

            <label className={`pay-option ${paymentMethod === "UPI" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={() => setPaymentMethod("UPI")}
              />
              <span>
                <strong>UPI / GPay / PhonePe</strong>
                <small>Mock online payment for demo</small>
              </span>
            </label>
          </fieldset>

          {paymentMethod === "COD" && (
            <div className="pay-note">
              You will pay in cash at delivery. Order status starts as pending /
              unpaid.
            </div>
          )}

          {paymentMethod === "UPI" && (
            <div className="upi-panel">
              <div className="upi-apps">
                <span>GPay</span>
                <span>PhonePe</span>
                <span>UPI</span>
              </div>
              <p className="upi-id">
                Pay to <strong>{MOCK_UPI_ID}</strong>
              </p>
              <div className="upi-qr" aria-hidden="true">
                <div className="upi-qr-inner">QR</div>
                <p>Scan mock QR · demo only</p>
              </div>
              <p className="upi-amount">
                Amount: <strong>₹{Number(total).toLocaleString("en-IN")}</strong>
              </p>
              {upiPaid ? (
                <p className="success-text">Payment successful (mock). You can place the order.</p>
              ) : (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={handleMockPay}
                  disabled={paying}
                >
                  {paying ? "Processing payment..." : "Pay now"}
                </button>
              )}
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || items.length === 0 || (paymentMethod === "UPI" && !upiPaid)}
          >
            {submitting
              ? "Placing order..."
              : paymentMethod === "UPI"
                ? "Place paid order"
                : "Place COD order"}
          </button>

          <Link to="/cart" className="back-link">
            ← Back to bag
          </Link>
        </form>
      </div>

      <aside className="checkout-summary">
        <h3>Order summary</h3>
        {loading ? (
          <p>Loading cart...</p>
        ) : (
          <>
            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
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
              <span>Total</span>
              <strong>₹{Number(total).toLocaleString("en-IN")}</strong>
            </div>
          </>
        )}
      </aside>
    </section>
  );
}
