"""Generate ShopKart project documentation PDF for interviews / viva."""
from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent / "ShopKart_Project_Documentation.pdf"


class DocPDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(90, 90, 90)
        self.cell(0, 8, "ShopKart Project Guide | Interview Preparation", align="C")
        self.ln(10)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="C")

    def h1(self, text):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(15, 118, 110)
        self.multi_cell(self.epw, 9, text)
        self.ln(2)
        self.set_draw_color(15, 118, 110)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(5)

    def h2(self, text):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(20, 33, 43)
        self.multi_cell(self.epw, 8, text)
        self.ln(2)

    def h3(self, text):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(40, 40, 40)
        self.multi_cell(self.epw, 7, text)
        self.ln(1)

    def body(self, text):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, text)
        self.ln(2)

    def bullet(self, text):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, f"- {text}")

    def code_block(self, text):
        self.set_x(self.l_margin)
        self.set_font("Courier", "", 8.5)
        self.set_fill_color(245, 247, 249)
        self.set_text_color(20, 20, 20)
        self.multi_cell(self.epw, 4.5, text, fill=True)
        self.ln(3)

    def qa(self, q, a):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(15, 90, 85)
        self.multi_cell(self.epw, 5.5, f"Q: {q}")
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, f"A: {a}")
        self.ln(3)


def build():
    pdf = DocPDF(format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()

    # Cover
    def cover_line(text, size=12, style="", color=(40, 40, 40), h=7):
        pdf.set_x(pdf.l_margin)
        pdf.set_font("Helvetica", style, size)
        pdf.set_text_color(*color)
        pdf.multi_cell(pdf.epw, h, text, align="C")

    pdf.ln(30)
    cover_line("ShopKart", size=28, style="B", color=(15, 118, 110), h=12)
    cover_line("Full-Stack E-Commerce Web Application", size=14, h=8)
    pdf.ln(4)
    cover_line(
        "Complete Project Explanation\n"
        "Key File / Line-by-Line Walkthrough\n"
        "Interview Questions & Answers",
        size=11,
        h=6,
    )
    pdf.ln(10)
    cover_line(
        "Tech: React (Vite) + Node.js/Express + MySQL + JWT\n"
        "Also deployable as a static SPA (Vercel / Netlify) with browser fallbacks",
        size=10,
        style="I",
        color=(80, 80, 80),
        h=6,
    )
    pdf.ln(16)
    cover_line(
        "Prepared for college project viva / software interview preparation.\n"
        "Repository structure: shopkart/client (frontend), shopkart/server (backend).",
        size=10,
        h=6,
    )

    # 1 Overview
    pdf.add_page()
    pdf.h1("1. Project Overview")
    pdf.body(
        "ShopKart is a full-stack e-commerce web app built as a college project. "
        "Users can browse products, create accounts, manage a cart and wishlist, "
        "place Cash on Delivery (COD) or mock UPI orders, and view order history. "
        "Admins can manage products and update order statuses."
    )
    pdf.body(
        "Important: Online UPI checkout is a mock demo flow for learning purposes. "
        "It does not connect to a real payment gateway like Razorpay or Stripe."
    )
    pdf.h2("1.1 Problem it solves")
    pdf.bullet("Gives a complete shopping flow from browse to order tracking")
    pdf.bullet("Separates user and admin roles with JWT authentication")
    pdf.bullet("Persists cart, wishlist, and orders in MySQL for local/full-stack mode")
    pdf.bullet(
        "Can still run as a static website online (Vercel/Netlify) using browser "
        "localStorage + a demo product catalog when no backend is available"
    )

    pdf.h2("1.2 Tech stack")
    pdf.bullet("Frontend: React 19, React Router 7, Vite 8, plain CSS")
    pdf.bullet("Backend: Node.js, Express 4")
    pdf.bullet("Database: MySQL (mysql2 pool)")
    pdf.bullet("Auth: JWT (jsonwebtoken) + password hashing (bcryptjs)")
    pdf.bullet("Deploy: Vercel / Netlify for frontend; Express+MySQL for full API")

    # 2 Architecture
    pdf.h1("2. Architecture")
    pdf.h2("2.1 High-level design")
    pdf.body(
        "ShopKart uses a client-server architecture. The React SPA talks to a REST API. "
        "In local development, Vite proxies /api requests to Express on port 5000. "
        "Express reads/writes MySQL. Protected routes require a Bearer JWT."
    )
    pdf.code_block(
        "Browser (React SPA :5173)\n"
        "   |  fetch('/api/...')\n"
        "   v\n"
        "Vite proxy (dev) ------------> Express API (:5000)\n"
        "                                  |\n"
        "                                  v\n"
        "                               MySQL (shopkart DB)"
    )
    pdf.h2("2.2 Two runtime modes")
    pdf.h3("A) Full-stack local mode (recommended for demos with MySQL)")
    pdf.bullet("Start server: cd server && npm run dev")
    pdf.bullet("Start client: cd client && npm run dev")
    pdf.bullet("All auth/cart/wishlist/orders persist in MySQL")
    pdf.h3("B) Static production mode (Vercel/Netlify without backend)")
    pdf.bullet("Products come from client/src/data/demoCatalog.js (42 items)")
    pdf.bullet("Auth uses client/src/localAuth.js (localStorage users + tokens)")
    pdf.bullet("Cart/orders use client/src/localShop.js")
    pdf.bullet("Wishlist uses localStorage via WishlistContext")
    pdf.body(
        "This dual-mode design is useful in interviews: it shows you understand "
        "frontend-only hosting limits and graceful API fallbacks."
    )

    # 3 Features
    pdf.h1("3. Features")
    pdf.h2("User features")
    pdf.bullet("Signup / Login / Logout with JWT session restoration")
    pdf.bullet("Profile update (name, email, phone, address, password)")
    pdf.bullet("Browse products with search, category filters, and sort")
    pdf.bullet("Product detail page with quantity, Add to bag, Buy now, Wishlist")
    pdf.bullet("Cart quantity update/remove and checkout")
    pdf.bullet("Wishlist add/remove and Move to cart")
    pdf.bullet("Orders list + order detail with payment method/status")
    pdf.bullet("Light/dark theme toggle (saved in localStorage)")
    pdf.h2("Admin features")
    pdf.bullet("Admin dashboard stats")
    pdf.bullet("Product create / update / delete")
    pdf.bullet("Order status updates: pending, confirmed, shipped, delivered, cancelled")
    pdf.body("Default seeded admin (local/demo): admin@shopkart.com / admin123")

    # 4 Structure
    pdf.h1("4. Project Structure")
    pdf.code_block(
        "shopkart/\n"
        "  client/                 React frontend (Vite)\n"
        "    src/\n"
        "      api.js              Shared fetch helper + fallbacks\n"
        "      localAuth.js        Browser auth for static hosting\n"
        "      localShop.js        Browser cart + orders\n"
        "      data/demoCatalog.js Demo products (42)\n"
        "      context/            Auth, Cart, Wishlist, Theme\n"
        "      components/         Navbar, ProductCard, etc.\n"
        "      pages/              Route screens\n"
        "      App.jsx             Routes + providers\n"
        "      main.jsx            React entry point\n"
        "  server/                 Express backend\n"
        "    server.js             App bootstrap\n"
        "    config/db.js          MySQL pool\n"
        "    middleware/auth.js    JWT + admin checks\n"
        "    routes/               auth, products, cart, wishlist, orders, admin\n"
        "    sql/schema.sql        Database tables\n"
        "  netlify.toml / vercel.json   Deploy config\n"
        "  netlify/functions/auth.js    Optional Netlify auth function"
    )

    # 5 Database
    pdf.h1("5. Database Design (MySQL)")
    pdf.body("Schema file: server/sql/schema.sql")
    pdf.bullet("users: id, name, email, password (hash), phone, address, role, created_at")
    pdf.bullet("products: id, name, description, price, image_url, category, stock")
    pdf.bullet("cart_items: id, user_id, product_id, quantity (unique user+product)")
    pdf.bullet("wishlist: id, user_id, product_id (unique user+product)")
    pdf.bullet(
        "orders: id, user_id, total_amount, status, payment_method, payment_status, "
        "shipping_address, phone, created_at"
    )
    pdf.bullet("order_items: id, order_id, product_id, quantity, price")
    pdf.body(
        "Relationships: users 1-N cart_items/wishlist/orders; products 1-N cart/wishlist/"
        "order_items; orders 1-N order_items. This is a classic e-commerce relational model."
    )

    # 6 Auth
    pdf.h1("6. Authentication Flow (JWT)")
    pdf.body(
        "1) User signs up or logs in with email/password.\n"
        "2) Server hashes passwords with bcrypt (never stores plain text).\n"
        "3) Server signs a JWT containing { id, email, role } with JWT_SECRET, expiry 7 days.\n"
        "4) Client stores token in localStorage key shopkart_token.\n"
        "5) apiRequest attaches Authorization: Bearer <token> on each call.\n"
        "6) authenticate middleware verifies token and sets req.user.\n"
        "7) requireAdmin blocks non-admin users from /api/admin/*.\n"
        "8) On app load, AuthContext calls GET /auth/me; invalid token is cleared."
    )

    # 7 API
    pdf.h1("7. REST API Endpoints")
    pdf.h3("Auth")
    pdf.bullet("POST /api/auth/signup, POST /api/auth/login")
    pdf.bullet("GET /api/auth/me, PUT /api/auth/profile (auth required)")
    pdf.h3("Products")
    pdf.bullet("GET /api/products, GET /api/products/categories, GET /api/products/:id")
    pdf.h3("Cart (auth)")
    pdf.bullet("GET /api/cart, POST /api/cart, PUT /api/cart/:id, DELETE /api/cart/:id")
    pdf.h3("Wishlist (auth)")
    pdf.bullet("GET/POST /api/wishlist, DELETE /api/wishlist/:productId")
    pdf.bullet("POST /api/wishlist/:productId/move-to-cart")
    pdf.h3("Orders (auth)")
    pdf.bullet("POST /api/orders, GET /api/orders, GET /api/orders/:id")
    pdf.h3("Admin (auth + admin role)")
    pdf.bullet("Stats, product CRUD, order status update under /api/admin/*")

    # 8 Line by line - key files
    pdf.h1("8. Key Code Walkthrough (Line-by-Line Style)")
    pdf.body(
        "A true line-by-line dump of every file would be hundreds of pages. Below is a "
        "practical interview-style walkthrough of the most important files, explained "
        "block by block / line group by line group."
    )

    pdf.h2("8.1 client/src/main.jsx")
    pdf.code_block(
        "import { StrictMode } from 'react';\n"
        "import { createRoot } from 'react-dom/client';\n"
        "import App from './App.jsx';\n"
        "import './index.css';\n\n"
        "createRoot(document.getElementById('root')).render(\n"
        "  <StrictMode><App /></StrictMode>\n"
        ");"
    )
    pdf.bullet("StrictMode: helps catch unsafe side effects during development")
    pdf.bullet("createRoot(...).render(...): React 18+/19 entry point mounting App")
    pdf.bullet("index.css: global theme variables and component styles")

    pdf.h2("8.2 client/src/App.jsx (routing + providers)")
    pdf.body(
        "App wraps the tree with ThemeProvider -> AuthProvider -> CartProvider -> "
        "WishlistProvider -> BrowserRouter. Then it renders Navbar, <Routes>, Footer."
    )
    pdf.bullet("Public routes: /, /about, /products, /products/:id, /login, /signup")
    pdf.bullet("Protected routes wrap Cart, Wishlist, Checkout, Profile, Orders")
    pdf.bullet("Admin route uses ProtectedRoute with adminOnly")
    pdf.bullet("ScrollToTop ensures navigation starts at page top (esp. mobile)")

    pdf.h2("8.3 client/src/api.js")
    pdf.body(
        "Central API helper. Builds URL from VITE_API_URL or '/api'. Adds JSON headers "
        "and Bearer token. On production without backend URL, auth/orders use local "
        "handlers; product GETs fall back to demoCatalog when response is not JSON."
    )
    pdf.bullet("apiRequest(path, options): main function used by pages/contexts")
    pdf.bullet("shouldUseLocalAuth(): true in PROD when VITE_API_URL is missing")
    pdf.bullet("This is why the live Vercel site still supports signup/cart/orders")

    pdf.h2("8.4 client/src/context/AuthContext.jsx")
    pdf.bullet("On mount: if shopkart_token exists, call /auth/me and set user")
    pdf.bullet("login(token, user): saves token + sets user state")
    pdf.bullet("logout(): clears token and user")
    pdf.bullet("isAdmin: user?.role === 'admin'")

    pdf.h2("8.5 client/src/context/CartContext.jsx")
    pdf.bullet("Keeps items, total, itemCount in React state")
    pdf.bullet("refreshCart/addToCart/update/remove call API or localShop helpers")
    pdf.bullet("Navbar bag badge reads itemCount from this context")

    pdf.h2("8.6 client/src/context/WishlistContext.jsx")
    pdf.bullet("Tracks wishlist items and a Set of productIds for heart toggles")
    pdf.bullet("toggleWishlist adds or removes; moveToCart adds to cart then removes")

    pdf.h2("8.7 client/src/components/ProductCard.jsx")
    pdf.bullet("Shows image, category, name, rating, price, MRP, discount badge")
    pdf.bullet("Heart button calls toggleWishlist (redirects to login if guest)")
    pdf.bullet("Add to bag button calls addToCart (redirects to login if guest)")
    pdf.bullet("Same card component is reused on Home and Products (consistent UI)")

    pdf.h2("8.8 client/src/components/ProtectedRoute.jsx")
    pdf.bullet("While auth loading: show checking message")
    pdf.bullet("If no user: Navigate to /login with state.from for redirect-back")
    pdf.bullet("If adminOnly and not admin: Navigate away from /admin")

    pdf.h2("8.9 client/src/pages/Checkout.jsx")
    pdf.bullet("Validates shipping address and 10-digit phone")
    pdf.bullet("Payment: COD or mock UPI (Pay now sets upiPaid=true after delay)")
    pdf.bullet("POST /orders with paymentMethod + paymentConfirmed")
    pdf.bullet("On success: navigate to order detail and clear cart state")

    pdf.h2("8.10 server/server.js")
    pdf.code_block(
        "app.use(cors());\n"
        "app.use(express.json());\n"
        "app.use('/api/auth', authRoutes);\n"
        "app.use('/api/products', productRoutes);\n"
        "app.use('/api/cart', cartRoutes);\n"
        "app.use('/api/wishlist', wishlistRoutes);\n"
        "app.use('/api/orders', orderRoutes);\n"
        "app.use('/api/admin', adminRoutes);\n"
        "await testConnection(); app.listen(PORT);"
    )
    pdf.bullet("cors(): allows React origin to call API")
    pdf.bullet("express.json(): parses JSON request bodies")
    pdf.bullet("testConnection(): fails fast if MySQL credentials are wrong")
    pdf.bullet("EADDRINUSE handler: helpful message if port 5000 is already taken")

    pdf.h2("8.11 server/middleware/auth.js")
    pdf.bullet("Reads Authorization header; must start with 'Bearer '")
    pdf.bullet("jwt.verify(token, JWT_SECRET) decodes payload")
    pdf.bullet("Attaches req.user = { id, email, role }")
    pdf.bullet("requireAdmin returns 403 if role is not admin")

    pdf.h2("8.12 server/routes/auth.js (concept)")
    pdf.bullet("Signup: validate -> check duplicate email -> bcrypt.hash -> INSERT user")
    pdf.bullet("Login: find user by email -> bcrypt.compare -> createToken")
    pdf.bullet("Profile: update fields; optional password change with current password")

    pdf.h2("8.13 server/routes/cart.js (concept)")
    pdf.bullet("All routes use authenticate middleware")
    pdf.bullet("Add to cart validates stock and uses INSERT ... ON DUPLICATE KEY UPDATE")
    pdf.bullet("GET cart joins cart_items with products for name/price/image/line_total")

    pdf.h2("8.14 server/routes/orders.js (concept)")
    pdf.bullet("Uses a DB transaction: lock cart rows, validate stock, insert order")
    pdf.bullet("Inserts order_items, decrements product stock, clears cart")
    pdf.bullet("UPI orders: payment_status=paid, status=confirmed")
    pdf.bullet("COD orders: payment_status=unpaid, status=pending")

    pdf.h2("8.15 Deploy configs")
    pdf.bullet("vercel.json: build client, publish client/dist, SPA rewrite to index.html")
    pdf.bullet("netlify.toml: similar SPA fallback + optional auth function redirect")
    pdf.bullet("Without SPA rewrite, refreshing /products would show Not Found")

    # 9 Run locally
    pdf.h1("9. How to Run Locally")
    pdf.code_block(
        "1) Create MySQL database: CREATE DATABASE shopkart;\n"
        "2) cd server -> copy .env.example to .env -> set DB_USER/DB_PASSWORD/JWT_SECRET\n"
        "3) npm install && npm run db:setup (or project setup script)\n"
        "4) npm run dev          # API on http://localhost:5000\n"
        "5) cd ../client && npm install && npm run dev\n"
        "6) Open http://localhost:5173"
    )

    # 10 Interview Q&A
    pdf.h1("10. Interview / Viva Questions & Answers")

    pdf.qa(
        "What is ShopKart?",
        "A full-stack e-commerce web app where users browse products, manage cart/"
        "wishlist, place COD or mock UPI orders, and admins manage products/orders.",
    )
    pdf.qa(
        "Which architecture did you use?",
        "Client-server REST architecture: React SPA frontend + Express REST API + MySQL. "
        "JWT for authentication between client and server.",
    )
    pdf.qa(
        "Why React and Vite?",
        "React provides component-based UI and reusable cards/contexts. Vite gives fast "
        "dev server, HMR, and simple production builds for a SPA.",
    )
    pdf.qa(
        "Why Express and MySQL?",
        "Express is a lightweight Node framework for REST APIs. MySQL stores relational "
        "data (users, products, cart, orders) with constraints and joins.",
    )
    pdf.qa(
        "How does JWT authentication work in your project?",
        "After login/signup the server signs a JWT with user id/email/role. Client stores "
        "it and sends Bearer token. Middleware verifies signature and expiry before "
        "protected routes run.",
    )
    pdf.qa(
        "Why bcrypt?",
        "Passwords must never be stored in plain text. bcrypt hashes passwords with salt "
        "so even DB leaks do not expose original passwords.",
    )
    pdf.qa(
        "Difference between authentication and authorization here?",
        "Authentication = proving identity (login/JWT). Authorization = permission check "
        "(requireAdmin allows only role=admin on admin APIs/pages).",
    )
    pdf.qa(
        "How is cart data stored?",
        "In full-stack mode, cart_items table keyed by user_id + product_id. In static "
        "hosting mode, cart is stored in localStorage via localShop.js.",
    )
    pdf.qa(
        "How do you prevent overselling stock?",
        "When adding to cart or placing an order, server checks quantity against product "
        "stock. Order placement uses a transaction and decrements stock.",
    )
    pdf.qa(
        "Explain checkout payment options.",
        "COD marks payment unpaid and order pending. Mock UPI requires a simulated Pay "
        "now confirmation; then payment is marked paid and order confirmed. No real "
        "payment gateway is integrated.",
    )
    pdf.qa(
        "What is ProtectedRoute?",
        "A React wrapper that redirects unauthenticated users to /login and optionally "
        "blocks non-admins from /admin.",
    )
    pdf.qa(
        "Why use Context API?",
        "Auth, cart, wishlist, and theme are global UI state. Context avoids prop drilling "
        "and lets Navbar badges and pages share the same data.",
    )
    pdf.qa(
        "How does search/filter/sort work?",
        "Products page reads URL search params (search, category, sort) and requests "
        "filtered products from API or demoCatalog handlers.",
    )
    pdf.qa(
        "What happens if the API is down on Vercel/Netlify?",
        "Product GETs fall back to demoCatalog. Auth/cart/wishlist/orders use "
        "localStorage implementations so basic shopping still works in demo mode.",
    )
    pdf.qa(
        "What is CORS and why did you enable it?",
        "Browsers block cross-origin requests by default. React (5173) and API (5000) "
        "are different origins in dev, so Express uses cors() middleware.",
    )
    pdf.qa(
        "Explain a DB transaction in order placement.",
        "Begin transaction, validate cart/stock, insert order + items, reduce stock, "
        "clear cart, commit. On error rollback so data stays consistent.",
    )
    pdf.qa(
        "What security practices did you follow?",
        "Password hashing, JWT secret in env, auth middleware on private routes, "
        "input validation, role checks for admin, no secrets committed in code.",
    )
    pdf.qa(
        "What is the difference between PUT and POST in your APIs?",
        "POST creates resources (signup, add cart item, place order). PUT updates "
        "existing resources (profile, cart quantity, admin product/order status).",
    )
    pdf.qa(
        "How would you improve this project further?",
        "Real payment gateway, server-side pagination, image uploads, email invoices, "
        "refresh tokens, rate limiting, unit/integration tests, hosted MySQL backend "
        "for production API.",
    )
    pdf.qa(
        "Why SPA rewrite is needed on Vercel/Netlify?",
        "React Router handles routes in the browser. Without rewrite to index.html, "
        "refreshing /products asks the host for a real file and returns Not Found.",
    )
    pdf.qa(
        "What is the role of Vite proxy?",
        "In development, requests to /api are forwarded to localhost:5000 so the "
        "frontend can call relative URLs without CORS pain during local coding.",
    )
    pdf.qa(
        "Normalize your database briefly.",
        "Users, products, and orders are separate tables. Bridge/line tables "
        "(cart_items, wishlist, order_items) avoid repeating product data and keep "
        "relations clean (approx. 3NF for core entities).",
    )
    pdf.qa(
        "How do you handle expired JWT?",
        "jwt.verify throws; middleware returns 401. AuthContext /auth/me catch clears "
        "token and treats user as logged out.",
    )
    pdf.qa(
        "Frontend state vs database state?",
        "React state is temporary UI state. MySQL (or localStorage fallback) is "
        "persistent source of truth across reloads/devices (DB) or browser (fallback).",
    )

    # 11 Quick answers cheat sheet
    pdf.h1("11. One-Minute Project Pitch")
    pdf.body(
        "ShopKart is a full-stack shopping website I built with React, Express, and MySQL. "
        "Users can register, browse a catalog, manage cart and wishlist, and place COD or "
        "mock UPI orders. Admins can manage products and order status. I used JWT + bcrypt "
        "for secure auth, REST APIs for communication, and Context API for shared UI state. "
        "For static hosting, I also implemented graceful localStorage fallbacks so signup, "
        "cart, and checkout still work without a live backend."
    )

    pdf.h1("12. Useful Commands Cheat Sheet")
    pdf.code_block(
        "cd server && npm run dev\n"
        "cd client && npm run dev\n"
        "cd client && npm run build\n"
        "MySQL: CREATE DATABASE shopkart;\n"
        "Admin demo: admin@shopkart.com / admin123"
    )

    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()
