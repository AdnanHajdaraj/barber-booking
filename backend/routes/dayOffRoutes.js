const express = require("express");

const {
    createDayOff,
    getDaysOff,
    deleteDayOff,
    getPublicDaysOff
} = require("../controllers/dayOffController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createDayOff);
router.get("/", authenticateToken, getDaysOff);
router.delete("/:id", authenticateToken, deleteDayOff);

// Public endpoint for the booking calendar
router.get("/public/:barberId", getPublicDaysOff);

module.exports = router;