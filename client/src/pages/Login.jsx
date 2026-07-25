import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resolveRedirect(nextUser, fromPath) {
    if (nextUser.role === "admin") {
      // Admin should land on dashboard, not a customer order page
      if (!fromPath || fromPath.startsWith("/orders")) return "/admin";
      return fromPath;
    }
    return fromPath || "/";
  }

  // Already logged in → go home (or back to the page they wanted)
  if (!loading && user) {
    return <Navigate to={resolveRedirect(user, location.state?.from)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      login(data.token, data.user);
      navigate(resolveRedirect(data.user, location.state?.from), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section narrow">
      <div className="section-heading">
        <h2>Login</h2>
        <p>Welcome back to ShopKart.</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="form-footer">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
