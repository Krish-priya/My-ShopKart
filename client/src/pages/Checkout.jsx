import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, loading, clearCartState } = useCart();
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="page-message">Loading checkout...</p>;
  }

  if (items.length === 0 && !submitting) {
    return <Navigate to="/cart" replace />;
  }

  async function placeCodOrder(trimmedAddress, trimmedPhone) {
    const data = await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        shippingAddress: trimmedAddress,
        phone: trimmedPhone,
        paymentMethod: "COD",
      }),
    });

    navigate(`/orders/${data.orderId}`, {
      state: {
        success: `Order #${data.orderId} placed — Cash on Delivery.`,
      },
      replace: true,
    });
    clearCartState();
  }

  async function placeRazorpayOrder(trimmedAddress, trimmedPhone) {
    const ready = await loadRazorpayScript();
    if (!ready) {
      throw new Error("Could not load Razorpay checkout. Check your network.");
    }

    const paymentOrder = await apiRequest("/payments/razorpay/create", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const key =
      import.meta.env.VITE_RAZORPAY_KEY_ID || paymentOrder.key;

    await new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "ShopKart",
        description: "Order payment (TEST mode)",
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: trimmedPhone,
        },
        theme: { color: "#0f766e" },
        handler: async (response) => {
          try {
            const data = await apiRequest("/orders", {
              method: "POST",
              body: JSON.stringify({
                shippingAddress: trimmedAddress,
                phone: trimmedPhone,
                paymentMethod: "RAZORPAY",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            navigate(`/orders/${data.orderId}`, {
              state: {
                success: `Order #${data.orderId} paid via Razorpay (TEST).`,
              },
              replace: true,
            });
            clearCartState();
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });

      rzp.on("payment.failed", (response) => {
        reject(
          new Error(
            response?.error?.description || "Razorpay payment failed"
          )
        );
      });

      rzp.open();
    });
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

    try {
      if (paymentMethod === "RAZORPAY") {
        await placeRazorpayOrder(trimmedAddress, trimmedPhone);
      } else {
        await placeCodOrder(trimmedAddress, trimmedPhone);
      }
    } catch (err) {
      setError(err.message || "Checkout failed");
      setSubmitting(false);
    }
  }

  return (
    <section className="section checkout-layout">
      <div>
        <div className="section-heading">
          <h2>Checkout</h2>
          <p>Pay with Cash on Delivery or Razorpay (TEST mode).</p>
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
                onChange={() => setPaymentMethod("COD")}
              />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when the order arrives</small>
              </span>
            </label>

            <label className={`pay-option ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="RAZORPAY"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => setPaymentMethod("RAZORPAY")}
              />
              <span>
                <strong>Online · Razorpay</strong>
                <small>UPI / Cards / Wallets · TEST mode</small>
              </span>
            </label>
          </fieldset>

          {paymentMethod === "COD" && (
            <div className="pay-note">
              You will pay in cash at delivery. Order status starts as pending /
              unpaid.
            </div>
          )}

          {paymentMethod === "RAZORPAY" && (
            <div className="upi-panel">
              <div className="upi-apps">
                <span>GPay</span>
                <span>PhonePe</span>
                <span>Cards</span>
                <span>UPI</span>
              </div>
              <p className="upi-amount">
                Amount: <strong>₹{Number(total).toLocaleString("en-IN")}</strong>
              </p>
              <p className="pay-note">
                Razorpay opens in TEST mode. No real money is charged.
                Use Razorpay test cards/UPI from their docs.
              </p>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || items.length === 0}
          >
            {submitting
              ? paymentMethod === "RAZORPAY"
                ? "Opening Razorpay..."
                : "Placing order..."
              : paymentMethod === "RAZORPAY"
                ? "Pay with Razorpay"
                : "Place COD order"}
          </button>

          <Link to="/cart" className="back-link">
            ← Back to bag
          </Link>
        </form>
      </div>

      <aside className="checkout-summary">
        <h3>Order summary</h3>
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
      </aside>
    </section>
  );
}
