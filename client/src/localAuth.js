/**
 * Browser auth for Netlify (no Express/MySQL).
 * Users are stored in localStorage so signup/login work on the live site.
 */

const USERS_KEY = "shopkart_users";
const TOKEN_PREFIX = "sk.";

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

async function hashPassword(password) {
  const data = new TextEncoder().encode(`shopkart:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function ensureSeedUser(users) {
  if (users.length > 0) return users;
  const seeded = [
    {
      id: 1,
      name: "Admin",
      email: "admin@shopkart.com",
      phone: "",
      address: "",
      password: await hashPassword("admin123"),
      role: "admin",
      created_at: new Date().toISOString(),
    },
  ];
  saveUsers(seeded);
  return seeded;
}

function createToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || "user",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  return TOKEN_PREFIX + btoa(JSON.stringify(payload));
}

function readToken(authHeader) {
  const header = authHeader || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  try {
    const payload = JSON.parse(atob(token.slice(TOKEN_PREFIX.length)));
    if (!payload?.id || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function ok(body) {
  return body;
}

function fail(message) {
  throw new Error(message);
}

export async function handleLocalAuth(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const auth = readToken(options.headers?.Authorization || "");
  let users = await ensureSeedUser(loadUsers());

  if (method === "POST" && path === "/auth/signup") {
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      fail("Name, email, and password are required");
    }
    if (!isValidEmail(email)) fail("Please enter a valid email address");
    if (password.length < 6) fail("Password must be at least 6 characters");
    if (users.some((u) => u.email === email)) fail("Email already registered");

    const user = {
      id: users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1,
      name,
      email,
      phone: "",
      address: "",
      password: await hashPassword(password),
      role: "user",
      created_at: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    const publicProfile = publicUser(user);
    return ok({
      message: "Account created successfully",
      token: createToken(publicProfile),
      user: publicProfile,
    });
  }

  if (method === "POST" && path === "/auth/login") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) fail("Email and password are required");

    const found = users.find((u) => u.email === email);
    const hash = await hashPassword(password);
    if (!found || found.password !== hash) {
      fail("Invalid email or password");
    }

    const publicProfile = publicUser(found);
    return ok({
      message: "Login successful",
      token: createToken(publicProfile),
      user: publicProfile,
    });
  }

  if (method === "GET" && path === "/auth/me") {
    if (!auth) fail("Please login first");
    const found = users.find((u) => Number(u.id) === Number(auth.id));
    if (!found) fail("User not found");
    return ok({ user: publicUser(found) });
  }

  if (method === "PUT" && path === "/auth/profile") {
    if (!auth) fail("Please login first");

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!name || name.length < 2) fail("Please enter your full name");
    if (!isValidEmail(email)) fail("Please enter a valid email address");
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      fail("Phone must be a 10-digit number");
    }

    const index = users.findIndex((u) => Number(u.id) === Number(auth.id));
    if (index < 0) fail("User not found");

    const current = users[index];
    if (email !== current.email && users.some((u) => u.email === email)) {
      fail("Email already in use by another account");
    }

    let nextHash = current.password;
    if (newPassword) {
      if (!currentPassword) {
        fail("Enter your current password to set a new one");
      }
      if ((await hashPassword(currentPassword)) !== current.password) {
        fail("Current password is incorrect");
      }
      if (newPassword.length < 6) {
        fail("New password must be at least 6 characters");
      }
      nextHash = await hashPassword(newPassword);
    }

    users[index] = {
      ...current,
      name,
      email,
      phone: phone || "",
      address: address || "",
      password: nextHash,
    };
    saveUsers(users);

    const publicProfile = publicUser(users[index]);
    return ok({
      message: "Profile updated successfully",
      user: publicProfile,
      token: createToken(publicProfile),
    });
  }

  fail("Auth route not found");
}

export function shouldUseLocalAuth() {
  // Live Netlify build has no Express/MySQL unless VITE_API_URL is set.
  return Boolean(import.meta.env.PROD) && !import.meta.env.VITE_API_URL;
}
