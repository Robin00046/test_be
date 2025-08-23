import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool } from "./db.js";
dotenv.config();

const run = async () => {
  const username = "admin";
  const passwordPlain = "admin123"; // ganti sesuai kebutuhan
  const name = "Dealer Admin";

  const hash = await bcrypt.hash(passwordPlain, 10);

  await pool.query(
    "INSERT INTO dealers (name, username, password, address) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password)",
    [name, username, hash, "Jl. Contoh No. 1"]
  );

  console.log(`OK. Dealer '${username}' siap. Password: ${passwordPlain}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
