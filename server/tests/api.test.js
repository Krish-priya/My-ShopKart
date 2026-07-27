require("dotenv").config();
const request = require("supertest");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const app = require("../server");

const stamp = Date.now();
const userEmail = `test.user.${stamp}@shopkart.test`;
const adminEmail = `test.admin.${stamp}@shopkart.test`;
const password = "Test@1234";

let userToken = "";
let adminToken = "";
let productId = null;

beforeAll(async () => {
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, 'user'), (?, ?, ?, 'admin')`,
    ["Test User", userEmail, hash, "Test Admin", adminEmail, hash]
  );

  const [products] = await pool.query(
    "SELECT id FROM products ORDER BY id ASC LIMIT 1"
  );
  if (products.length === 0) {
    const [created] = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock)
       VALUES ('Test Product', 'For automated tests', 499, 'https://example.com/p.jpg', 'Electronics', 20)`
    );
    productId = created.insertId;
  } else {
    productId = products[0].id;
  }
});

afterAll(async () => {
  await pool.query("DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?))", [
    userEmail,
    adminEmail,
  ]);
  await pool.query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?)))", [
    userEmail,
    adminEmail,
  ]);
  await pool.query("DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email IN (?, ?))", [
    userEmail,
    adminEmail,
  ]);
  await pool.query("DELETE FROM users WHERE email IN (?, ?)", [userEmail, adminEmail]);
  await pool.end();
});

describe("ShopKart API", () => {
  test("signup validation fails for bad email", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Bad",
      email: "not-an-email",
      password: "123456",
    });
    expect(res.status).toBe(400);
  });

  test("login succeeds for seeded test user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    userToken = res.body.token;
  });

  test("login fails with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password: "wrong-password",
    });
    expect(res.status).toBe(401);
  });

  test("protected cart rejects missing token", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
  });

  test("add to cart requires auth and works with token", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });
    expect([200, 201]).toContain(res.status);
  });

  test("admin route forbidden for normal user", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test("admin can access stats", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password,
    });
    adminToken = login.body.token;

    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("products");
  });

  test("place COD order happy path", async () => {
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        shippingAddress: "12 Test Street, Chennai 600001",
        phone: "9876543210",
        paymentMethod: "COD",
      });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toBeTruthy();
    expect(res.body.paymentMethod).toBe("COD");
    expect(res.body.paymentStatus).toBe("unpaid");
  });
});
