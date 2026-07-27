# Deploy ShopKart

This guide deploys ShopKart for a **live resume demo**.

Do not claim the app is live until you paste real URLs into the README.

## Architecture

- Frontend: Vercel or Netlify (React/Vite)
- Backend: Render or Railway (Node/Express)
- Database: Managed MySQL (Railway / Aiven / PlanetScale-compatible / Render MySQL)

## 1) Prepare MySQL

1. Create a managed MySQL instance
2. Create database `shopkart`
3. Note host, port, user, password
4. From your laptop (with network access to the DB), run:

```bash
cd server
# put managed DB values into .env first
npm run db:setup
npm run db:migrate
npm run db:migrate:profile
npm run db:migrate:payments
```

## 2) Deploy backend (Render example)

1. Push this repo to GitHub
2. Create a new **Web Service** on Render
3. Root directory: `server`
4. Build: `npm install`
5. Start: `npm start`
6. Add env vars:

```text
PORT=5000
DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=shopkart
JWT_SECRET=long_random_string
CORS_ORIGIN=https://YOUR-FRONTEND-URL
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

7. Copy the backend URL, e.g. `https://shopkart-api.onrender.com`

## 3) Deploy frontend (Vercel example)

1. Import the GitHub repo in Vercel
2. Root directory: `client`
3. Framework: Vite
4. Env vars:

```text
VITE_API_URL=https://shopkart-api.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

5. Deploy
6. Copy frontend URL, e.g. `https://shopkart.vercel.app`
7. Update backend `CORS_ORIGIN` to that frontend URL and redeploy backend

## 4) Post-deploy checklist

- [ ] Open frontend URL
- [ ] Signup / login works
- [ ] Products load from API (not only demo fallback)
- [ ] COD checkout works
- [ ] Razorpay TEST checkout opens
- [ ] Admin login works
- [ ] Paste both URLs into README “Live Demo” section

## Notes

- Razorpay remains in **TEST mode** for portfolio demos
- Never commit real `.env` files or key CSVs
- Free tiers may sleep; first request can be slow
