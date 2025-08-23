import { Router } from "express";
import { pool } from "../db.js";
import { body, validationResult } from "express-validator";
import { auth } from "../middleware/auth.js";

const router = Router();

/** CUSTOMER: buat booking (transaksi + SELECT ... FOR UPDATE untuk aman) */
router.post(
  "/bookings",
  body("name").isLength({ min: 2 }),
  body("phone_no").isLength({ min: 6 }),
  body("vehicle_type").notEmpty(),
  body("license_plate").notEmpty(),
  body("vehicle_problem").isLength({ min: 5 }),
  body("service_schedule_id").isInt({ min: 1 }),
  body("service_time").matches(/^\d{2}:\d{2}$/), // HH:mm
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      name,
      phone_no,
      vehicle_type,
      license_plate,
      vehicle_problem,
      service_schedule_id,
      service_time,
    } = req.body;

    // H+1 validasi langsung dari tanggal schedule
    const [d] = await pool.query(
      "SELECT schedule_date FROM service_schedules WHERE id = ?",
      [service_schedule_id]
    );
    if (d.length === 0)
      return res.status(400).json({ message: "Jadwal tidak ditemukan" });
    const [ok] = await pool.query("SELECT ? > CURDATE() AS ok", [
      d[0].schedule_date,
    ]);
    if (!ok[0].ok)
      return res.status(400).json({ message: "Pemesanan hanya untuk H+1" });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // lock baris jadwal
      const [sched] = await conn.query(
        "SELECT id, quota FROM service_schedules WHERE id = ? FOR UPDATE",
        [service_schedule_id]
      );
      if (!sched.length || sched[0].quota <= 0) {
        await conn.rollback();
        return res.status(409).json({ message: "Kuota habis" });
      }

      // simpan booking (status default = 1)
      await conn.query(
        `INSERT INTO service_bookings
        (name, phone_no, vehicle_type, license_plate, vehicle_problem, service_schedule_id, service_time, service_status_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          name,
          phone_no,
          vehicle_type,
          license_plate,
          vehicle_problem,
          service_schedule_id,
          service_time,
        ]
      );

      // kurangi kuota
      await conn.query(
        "UPDATE service_schedules SET quota = quota - 1 WHERE id = ?",
        [service_schedule_id]
      );

      await conn.commit();
      res.json({ message: "Booking berhasil dibuat" });
    } catch (e) {
      await conn.rollback();
      if (e.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({
            message: "Plat/jam tersebut sudah dipesan pada tanggal ini",
          });
      }
      throw e;
    } finally {
      conn.release();
    }
  }
);

/** DEALER: lihat semua booking */
router.get("/bookings", auth, async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT sb.*, ss.schedule_date, st.name AS status_name
     FROM service_bookings sb
     JOIN service_schedules ss ON ss.id = sb.service_schedule_id
     JOIN service_statuses st ON st.id = sb.service_status_id
     ORDER BY ss.schedule_date ASC, sb.service_time ASC, sb.created_at ASC`
  );
  res.json(rows);
});

/** DEALER: ubah status booking (+/- kuota bila transisi ke/dari 'konfirmasi batal') */
router.put(
  "/bookings/:id/status",
  auth,
  body("status_id").isInt({ min: 1, max: 5 }),
  async (req, res) => {
    const { id } = req.params;
    const { status_id } = req.body;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [b] = await conn.query(
        "SELECT id, service_status_id, service_schedule_id FROM service_bookings WHERE id = ? FOR UPDATE",
        [id]
      );
      if (!b.length) {
        await conn.rollback();
        return res.status(404).json({ message: "Booking tidak ditemukan" });
      }
      const prev = b[0].service_status_id;
      const scheduleId = b[0].service_schedule_id;

      await conn.query(
        "UPDATE service_bookings SET service_status_id = ? WHERE id = ?",
        [status_id, id]
      );

      // Transisi kuota:
      // prev != batal (2) -> now batal (2) => +1
      // prev == batal (2) -> now != batal (2) => -1 (jika kuota tersedia)
      if (prev !== 2 && status_id === 2) {
        await conn.query(
          "UPDATE service_schedules SET quota = quota + 1 WHERE id = ?",
          [scheduleId]
        );
      } else if (prev === 2 && status_id !== 2) {
        // pastikan kuota masih ada untuk dipakai lagi
        const [s] = await conn.query(
          "SELECT quota FROM service_schedules WHERE id = ? FOR UPDATE",
          [scheduleId]
        );
        if (s[0].quota <= 0) {
          await conn.rollback();
          return res
            .status(409)
            .json({
              message:
                "Kuota tidak cukup untuk mengembalikan booking dari status batal",
            });
        }
        await conn.query(
          "UPDATE service_schedules SET quota = quota - 1 WHERE id = ?",
          [scheduleId]
        );
      }

      await conn.commit();
      res.json({ message: "Status diupdate" });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
);

export default router;
