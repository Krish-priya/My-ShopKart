const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { signupRules, loginRules, profileRules } = require("../middleware/validators");

const router = express.Router();

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    address: row.address || "",
    role: row.role,
    created_at: row.created_at,
  };
}

router.post("/signup", signupRules, validate, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashedPassword]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      phone: "",
      address: "",
      role: "user",
    };

    res.status(201).json({
      message: "Account created successfully",
      token: createToken(user),
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

router.post("/login", loginRules, validate, async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userRow = rows[0];
    const match = await bcrypt.compare(password, userRow.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = publicUser(userRow);
    res.json({
      message: "Login successful",
      token: createToken(user),
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: publicUser(rows[0]) });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authenticate, profileRules, validate, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const address = String(req.body.address || "").trim();
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const current = rows[0];

    if (email !== current.email) {
      const [taken] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, req.user.id]
      );
      if (taken.length > 0) {
        return res.status(409).json({ message: "Email already in use by another account" });
      }
    }

    let nextPasswordHash = current.password;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Enter your current password to set a new one",
        });
      }

      const match = await bcrypt.compare(currentPassword, current.password);
      if (!match) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      nextPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    await pool.query(
      `UPDATE users
       SET name = ?, email = ?, phone = ?, address = ?, password = ?
       WHERE id = ?`,
      [name, email, phone || null, address || null, nextPasswordHash, req.user.id]
    );

    const [updatedRows] = await pool.query(
      "SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    const user = publicUser(updatedRows[0]);
    res.json({
      message: "Profile updated successfully",
      user,
      token: createToken(user),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({
        message: "Profile columns missing. Run: npm run db:migrate:profile",
      });
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
