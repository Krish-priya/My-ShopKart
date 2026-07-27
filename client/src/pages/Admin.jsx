import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../api";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Footwear",
  "Accessories",
  "Home",
  "Beauty",
  "General",
];
const PIE_COLORS = ["#0f766e", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category: "Electronics",
  stock: "",
};

export default function Admin() {
  const [tab, setTab] = useState("analytics");
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, analyticsData] = await Promise.all([
        apiRequest("/admin/stats"),
        apiRequest("/admin/orders"),
        apiRequest("/admin/products"),
        apiRequest("/admin/analytics"),
      ]);
      setStats(statsData);
      setOrders(ordersData.orders);
      setProducts(productsData.products);
      setAnalytics(analyticsData);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      image_url: product.image_url || "",
      category: product.category || "General",
      stock: String(product.stock ?? ""),
    });
    setTab("products");
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      category: form.category.trim() || "General",
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await apiRequest(`/admin/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess(`Product #${editingId} updated`);
      } else {
        const data = await apiRequest("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess(`Product #${data.productId} created`);
      }

      resetForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;

    setError("");
    setSuccess("");
    try {
      await apiRequest(`/admin/products/${id}`, { method: "DELETE" });
      if (editingId === id) resetForm();
      setSuccess(`Product #${id} deleted`);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(orderId, status) {
    setError("");
    setSuccess("");
    try {
      await apiRequest(`/admin/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setSuccess(`Order #${orderId} marked as ${status}`);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading && !stats) {
    return <p className="page-message">Loading admin panel...</p>;
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>Admin dashboard</h2>
        <p>Add, edit, or delete products and update order status. Login: admin@shopkart.com</p>
      </div>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      {stats && (
        <div className="stats-row">
          <div>
            <strong>{stats.products}</strong>
            <span>Products</span>
          </div>
          <div>
            <strong>{stats.users}</strong>
            <span>Users</span>
          </div>
          <div>
            <strong>{stats.orders}</strong>
            <span>Orders</span>
          </div>
          <div>
            <strong>₹{Number(stats.revenue).toLocaleString("en-IN")}</strong>
            <span>Revenue</span>
          </div>
        </div>
      )}

      <div className="filter-row">
        <button
          type="button"
          className={`filter-btn ${tab === "analytics" ? "active" : ""}`}
          onClick={() => setTab("analytics")}
        >
          Analytics
        </button>
        <button
          type="button"
          className={`filter-btn ${tab === "products" ? "active" : ""}`}
          onClick={() => setTab("products")}
        >
          Products
        </button>
        <button
          type="button"
          className={`filter-btn ${tab === "orders" ? "active" : ""}`}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
      </div>

      {tab === "analytics" && analytics && (
        <div className="analytics-grid">
          <div className="form-card chart-card">
            <h3>Revenue (last 14 days)</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={analytics.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2} name="Revenue ₹" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="form-card chart-card">
            <h3>Orders by status</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {analytics.ordersByStatus.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="form-card chart-card chart-card-wide">
            <h3>Top products</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="units_sold" fill="#f59e0b" name="Units sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="admin-grid">
          <form className="form-card" onSubmit={handleProductSubmit}>
            <h3>{editingId ? `Edit product #${editingId}` : "Add product"}</h3>

            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <label>
              Price (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>

            <label>
              Image URL
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </label>

            <div className="detail-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update product" : "Add product"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <div>
            <h3>All products ({products.length})</h3>
            <div className="admin-list">
              {products.length === 0 ? (
                <p className="page-message">No products yet.</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="admin-item">
                    <img
                      className="admin-thumb"
                      src={product.image_url || "https://via.placeholder.com/80"}
                      alt={product.name}
                    />
                    <div>
                      <strong>
                        #{product.id} · {product.name}
                      </strong>
                      <p>
                        {product.category} · ₹{Number(product.price).toLocaleString("en-IN")} · stock{" "}
                        {product.stock}
                      </p>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="page-message">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="admin-order-card">
                <div className="admin-order-top">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p>
                      {order.customer_name} · {order.customer_email}
                    </p>
                    <p className="stock-text">
                      {new Date(order.created_at).toLocaleString()} · {order.item_count}{" "}
                      {Number(order.item_count) === 1 ? "item" : "items"} · {order.payment_method}
                      {order.payment_status ? ` · ${order.payment_status}` : ""}
                    </p>
                  </div>
                  <div className="admin-order-meta">
                    <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                    <label>
                      Status
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <p className="admin-order-address">
                  <strong>Ship to:</strong> {order.shipping_address}
                  <br />
                  <strong>Phone:</strong> {order.phone}
                </p>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}
