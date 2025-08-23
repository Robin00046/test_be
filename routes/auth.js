import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

// Login dealer
router.post("/dealer/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "username & password required" });

  const [rows] = await pool.query("SELECT * FROM dealers WHERE username = ?", [
    username,
  ]);
  if (rows.length === 0)
    return res.status(401).json({ message: "Dealer not found" });

  const dealer = rows[0];
  const ok = await bcrypt.compare(password, dealer.password);
  if (!ok) return res.status(401).json({ message: "Wrong credentials" });

  const token = jwt.sign(
    { id: dealer.id, username: dealer.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token });
});

export default router;
