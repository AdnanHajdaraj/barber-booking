const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const workingHoursRoutes = require("./routes/workingHoursRoutes");
const breakRoutes = require("./routes/breakRoutes");
const dayOffRoutes = require("./routes/dayOffRoutes");
const barberRoutes = require("./routes/barberRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/working-hours", workingHoursRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/breaks", breakRoutes);
app.use("/api/days-off", dayOffRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        message: "Barber Booking API is running"
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000
;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});