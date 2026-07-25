# ShopKart

A beginner-friendly full-stack e-commerce website built for college project submission.

ShopKart lets users browse products, manage a cart and wishlist, place **COD** or **mock UPI** orders, and view order history. Admins can manage products and update order status.

> Online UPI checkout is a **college-project mock** (no real payment gateway).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite), HTML, CSS, JavaScript |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |

---

## Features

### User
- Signup / Login with JWT authentication
- Browse products with search, category filter, and sort
- View product details
- Add / update / remove cart items (saved in MySQL)
- Wishlist (add/remove, move to cart)
- Cart + wishlist counts in navbar
- Checkout with COD or mock UPI (GPay/PhonePe style demo)
- View order history with payment method + payment status

### Admin
- Login with admin account
- Dashboard stats
- Add / edit / delete products
- Update order status (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)

---

## Project Structure

```text
shopkart/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Navbar, ProductCard, ProtectedRoute
│       ├── context/        # Auth + Cart state
│       ├── pages/          # All app pages
│       └── api.js          # API helper
└── server/                 # Express backend
    ├── config/             # MySQL connection
    ├── middleware/         # JWT auth middleware
    ├── routes/             # API routes
    ├── scripts/            # Database setup + seed
    ├── sql/                # schema.sql + seed.sql
    └── server.js           # App entry point
```

---

## Prerequisites

1. **Node.js** (v18 or newer recommended)
2. **MySQL** installed and running
3. A MySQL database already created named:

```sql
CREATE DATABASE shopkart;
```

---

## Setup Instructions

### 1) Backend setup

Open a terminal in the project folder:

```bash
cd server
copy .env.example .env
```

On macOS/Linux use:

```bash
cp .env.example .env
```

Edit `server/.env` and set your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shopkart
JWT_SECRET=any_long_random_secret_string
```

Install packages, create tables, and seed sample data:

```bash
npm install
npm run db:setup
npm run dev
```

Backend runs at: **http://localhost:5000**

If your database already exists from an older ShopKart version, also run:

```bash
cd server
npm run db:migrate
```

Or run this SQL in MySQL:

```sql
SOURCE server/sql/migrate_wishlist_payment.sql;
```

`db:setup` will:
- create tables (`users`, `products`, `cart_items`, `orders`, `order_items`)
- insert **12 sample products**
- create the default admin account

### 2) Frontend setup

Open a **second** terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@shopkart.com` |
| Password | `admin123` |

Use this account to open the **Admin** page.

---

## How to Test the Project

1. Open http://localhost:5173
2. Create a normal user account from **Sign up**
3. Browse **Products**, open a product, click **Add to cart**
4. Open **Cart**, change quantity, then go to **Checkout**
5. Enter address + 10-digit phone and place a **COD** order
6. Check **Orders** and open order details
7. Logout, login as admin, open **Admin**
8. Add/edit a product and update an order status

---

## Main Pages / Routes

| Route | Page |
|-------|------|
| `/` | Home |
| `/products` | Product list (search / filter / sort) |
| `/products/:id` | Product detail |
| `/cart` | Cart (login required) |
| `/checkout` | Checkout COD (login required) |
| `/login` | Login |
| `/signup` | Signup |
| `/orders` | Order history (login required) |
| `/orders/:id` | Order details (login required) |
| `/admin` | Admin panel (admin only) |

---

## Important API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Product details |
| GET/POST/PUT/DELETE | `/api/cart` | Cart operations |
| POST | `/api/orders` | Place COD order |
| GET | `/api/orders` | User order history |
| GET | `/api/orders/:id` | Order details |
| `/api/admin/*` | Admin product + order management |

---

## Notes for Evaluation

- Cart and orders are stored in **MySQL**, not only in browser memory
- Protected pages redirect guests to Login
- Only **Cash on Delivery** is supported (no Razorpay/Stripe/etc.)
- UI is responsive for mobile and desktop

---

## Troubleshooting

**Backend says MySQL connection failed**
- Check username/password in `server/.env`
- Confirm MySQL service is running
- Confirm database `shopkart` exists

**Frontend cannot load products**
- Make sure backend is running on port 5000
- Restart both servers after changing `.env`

**Admin page not visible**
- Login with `admin@shopkart.com` / `admin123`
- Normal users cannot access `/admin`

---

## Author

College project: **ShopKart** full-stack e-commerce website.
