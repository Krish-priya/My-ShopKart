/**
 * Netlify Function: /api/auth/*
 * Stores users in Netlify Blobs so signup/login work on the live site
 * without a separate Express/MySQL server.
 */
const { getStore } = require("@netlify/blobs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "shopkart-netlify-demo-secret-change-me";
const USERS_KEY = "users";

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    role: user.role || "user",
    created_at: user.created_at,
  };
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function getAuthUser(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function routePath(event) {
  const raw = event.path || "";
  return (
    raw
      .replace(/^\/\.netlify\/functions\/auth\/?/, "/")
      .replace(/^\/api\/auth\/?/, "/")
      .replace(/\/+$/, "") || "/"
  );
}

async function loadUsers(store) {
  const users = (await store.get(USERS_KEY, { type: "json" })) || [];
  if (!Array.isArray(users) || users.length === 0) {
    const password = await bcrypt.hash("admin123", 10);
    const seeded = [
      {
        id: 1,
        name: "Admin",
        email: "admin@shopkart.com",
        phone: "",
        address: "",
        password,
        role: "admin",
        created_at: new Date().toISOString(),
      },
    ];
    await store.setJSON(USERS_KEY, seeded);
    return seeded;
  }
  return users;
}

async function saveUsers(store, users) {
  await store.setJSON(USERS_KEY, users);
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  try {
    const store = getStore("shopkart-users");
    const path = routePath(event);
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    if (method === "POST" && path === "/signup") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!name || !email || !password) {
        return json(400, { message: "Name, email, and password are required" });
      }
      if (!isValidEmail(email)) {
        return json(400, { message: "Please enter a valid email address" });
      }
      if (password.length < 6) {
        return json(400, { message: "Password must be at least 6 characters" });
      }

      const users = await loadUsers(store);
      if (users.some((u) => u.email === email)) {
        return json(409, { message: "Email already registered" });
      }

      const user = {
        id: users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1,
        name,
        email,
        phone: "",
        address: "",
        password: await bcrypt.hash(password, 10),
        role: "user",
        created_at: new Date().toISOString(),
      };
      users.push(user);
      await saveUsers(store, users);

      const publicProfile = publicUser(user);
      return json(201, {
        message: "Account created successfully",
        token: createToken(publicProfile),
        user: publicProfile,
      });
    }

    if (method === "POST" && path === "/login") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password) {
        return json(400, { message: "Email and password are required" });
      }

      const users = await loadUsers(store);
      const found = users.find((u) => u.email === email);
      if (!found || !(await bcrypt.compare(password, found.password))) {
        return json(401, { message: "Invalid email or password" });
      }

      const publicProfile = publicUser(found);
      return json(200, {
        message: "Login successful",
        token: createToken(publicProfile),
        user: publicProfile,
      });
    }

    if (method === "GET" && path === "/me") {
      const auth = getAuthUser(event);
      if (!auth) return json(401, { message: "Please login first" });

      const users = await loadUsers(store);
      const found = users.find((u) => Number(u.id) === Number(auth.id));
      if (!found) return json(404, { message: "User not found" });
      return json(200, { user: publicUser(found) });
    }

    if (method === "PUT" && path === "/profile") {
      const auth = getAuthUser(event);
      if (!auth) return json(401, { message: "Please login first" });

      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const address = String(body.address || "").trim();
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");

      if (!name || name.length < 2) {
        return json(400, { message: "Please enter your full name" });
      }
      if (!isValidEmail(email)) {
        return json(400, { message: "Please enter a valid email address" });
      }
      if (phone && !/^[0-9]{10}$/.test(phone)) {
        return json(400, { message: "Phone must be a 10-digit number" });
      }

      const users = await loadUsers(store);
      const index = users.findIndex((u) => Number(u.id) === Number(auth.id));
      if (index < 0) return json(404, { message: "User not found" });

      const current = users[index];
      if (email !== current.email && users.some((u) => u.email === email)) {
        return json(409, { message: "Email already in use by another account" });
      }

      let nextHash = current.password;
      if (newPassword) {
        if (!currentPassword) {
          return json(400, {
            message: "Enter your current password to set a new one",
          });
        }
        const match = await bcrypt.compare(currentPassword, current.password);
        if (!match) return json(401, { message: "Current password is incorrect" });
        if (newPassword.length < 6) {
          return json(400, { message: "New password must be at least 6 characters" });
        }
        nextHash = await bcrypt.hash(newPassword, 10);
      }

      users[index] = {
        ...current,
        name,
        email,
        phone: phone || "",
        address: address || "",
        password: nextHash,
      };
      await saveUsers(store, users);

      const publicProfile = publicUser(users[index]);
      return json(200, {
        message: "Profile updated successfully",
        user: publicProfile,
        token: createToken(publicProfile),
      });
    }

    return json(404, { message: "Auth route not found" });
  } catch (error) {
    console.error("Netlify auth error:", error);
    return json(500, {
      message: error.message || "Server error during authentication",
    });
  }
};
