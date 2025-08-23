import { Router } from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = Router();

/** PUBLIC: jadwal dengan sisa kuota */
router.get("/schedules", async (_req, res) => {
  const [rows] = await pool.query(
    "SELECT id, schedule_date, quota FROM service_schedules WHERE quota > 0 AND schedule_date > CURDATE() ORDER BY schedule_date ASC"
  );
  res.json(rows);
});

/** DEALER: tambah jadwal */
router.post(
  "/schedules",
  auth,
  body("schedule_date")
    .isISO8601()
    .withMessage("schedule_date harus format YYYY-MM-DD"),
  body("quota").isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { schedule_date, quota } = req.body;
    // H+1 check
    const [r] = await pool.query("SELECT ? > CURDATE() AS ok", [schedule_date]);
    if (!r[0].ok)
      return res
        .status(400)
        .json({ message: "Tanggal harus H+1 (lebih dari hari ini)" });

    try {
      await pool.query(
        "INSERT INTO service_schedules (schedule_date, quota) VALUES (?, ?)",
        [schedule_date, quota]
      );
      res.json({ message: "Jadwal berhasil ditambahkan" });
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Tanggal tersebut sudah ada" });
      }
      throw e;
    }
  }
);

/** DEALER: ubah kuota jadwal */
router.put(
  "/schedules/:id",
  auth,
  body("quota").optional().isInt({ min: 0 }),
  async (req, res) => {
    const { id } = req.params;
    const { quota } = req.body;
    await pool.query(
      "UPDATE service_schedules SET quota = COALESCE(?, quota) WHERE id = ?",
      [quota, id]
    );
    res.json({ message: "Jadwal diupdate" });
  }
);

export default router;
