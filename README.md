# ShopKart

Full-stack e-commerce web app built with **React (Vite)**, **Node.js/Express**, and **MySQL**.

ShopKart lets users browse products, manage cart and wishlist, place **COD** or **mock UPI** orders, and view order history. Admins can manage products and update order status.

> UPI checkout is a **college-project mock** (no real payment gateway).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite), HTML, CSS, JavaScript |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Deploy | Vercel / Netlify (frontend SPA) |

---

## Features

### User
- Signup / Login with JWT authentication
- Browse products (search, category filter, sort)
- Product detail page
- Cart (add / update / remove)
- Wishlist (add / remove / move to cart)
- Checkout with **COD** or **mock UPI**
- Order history + order details
- Profile update
- Light / dark theme

### Admin
- Dashboard stats
- Add / edit / delete products
- Update order status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)

---

## Project Structure

```text
shopkart/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Navbar, ProductCard, ProtectedRoute...
│       ├── context/        # Auth, Cart, Wishlist, Theme
│       ├── pages/          # App pages
│       ├── data/           # Demo catalog (static hosting fallback)
│       ├── api.js          # API helper
│       ├── localAuth.js    # Browser auth fallback
│       └── localShop.js    # Browser cart/orders fallback
├── server/                 # Express backend
│   ├── config/             # MySQL connection
│   ├── middleware/         # JWT auth
│   ├── routes/             # API routes
│   ├── scripts/            # DB setup + seed
│   ├── sql/                # schema + migrations
│   └── server.js
├── docs/                   # Project documentation PDF
├── vercel.json             # Vercel deploy config
└── netlify.toml            # Netlify deploy config
```

---

## Local Setup

### Prerequisites
1. Node.js v18+
2. MySQL running
3. Database created:

```sql
CREATE DATABASE shopkart;
```

### 1) Backend

```bash
cd server
copy .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shopkart
JWT_SECRET=any_long_random_secret_string
```

```bash
npm install
npm run db:setup
npm run dev
```

API: **http://localhost:5000**

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

App: **http://localhost:5173**

---

## Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@shopkart.com` |
| Password | `admin123` |

---

## How to Test

1. Open http://localhost:5173
2. Sign up a normal user
3. Browse products → Add to bag / Wishlist
4. Open Cart → Checkout (COD or mock UPI)
5. Check Orders
6. Logout → login as admin → open Admin

---

## Routes

| Route | Page |
|-------|------|
| `/` | Home |
| `/products` | Product list |
| `/products/:id` | Product detail |
| `/cart` | Cart (login required) |
| `/wishlist` | Wishlist (login required) |
| `/checkout` | Checkout (login required) |
| `/login` | Login |
| `/signup` | Signup |
| `/profile` | Profile (login required) |
| `/orders` | Orders (login required) |
| `/orders/:id` | Order details |
| `/admin` | Admin panel (admin only) |
| `/about` | About |

---

## Deploy Notes

### Vercel (recommended when Netlify credits are paused)
- Connect the GitHub repo
- Root can stay at repository root (`vercel.json` builds `client`)
- SPA rewrite is already configured

### Static hosting fallback
If no Express/MySQL backend is connected:
- Products load from `client/src/data/demoCatalog.js` (42 products)
- Auth / cart / wishlist / orders use browser `localStorage`

For a full production API, host Express + MySQL separately and set `VITE_API_URL`.

---

## Documentation

Project explanation + interview Q&A PDF:

`docs/ShopKart_Project_Documentation.pdf`

Regenerate PDF (optional):

```bash
pip install fpdf2
python docs/generate_shopkart_pdf.py
```

---

## Troubleshooting

**MySQL connection failed**
- Check `server/.env`
- Confirm MySQL is running and database `shopkart` exists

**Port 5000 already in use**
- Stop the other process using port 5000, then restart the server

**Frontend cannot load products (local)**
- Start backend on port 5000

**Admin page not visible**
- Login with `admin@shopkart.com` / `admin123`

---

## Author

ShopKart — full-stack e-commerce college project.
