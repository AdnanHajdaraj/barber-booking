const express = require("express");

const {
    getAvailableSlots,
    createAppointment,
    cancelAppointment,
    getMyAppointments,
    getBarberAppointments,
    updateAppointmentStatus
} = require("../controllers/appointmentController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/availability", getAvailableSlots);

router.post("/", authenticateToken, createAppointment);

router.patch("/:id/cancel", authenticateToken, cancelAppointment);

router.get("/my", authenticateToken, getMyAppointments);

router.get("/barber", authenticateToken, getBarberAppointments);

router.patch("/:id/status", authenticateToken, updateAppointmentStatus);
module.exports = router;