import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import schedulesRoutes from "./routes/schedules.js";
import bookingsRoutes from "./routes/bookings.js";

dotenv.config();
const app = express();

app.use(express.json());

// routes
app.use(authRoutes);
app.use(schedulesRoutes);
app.use(bookingsRoutes);

// healthcheck
app.get("/", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
