const express = require("express");

const {
    setWorkingHours,
    getWorkingHours,
    getPublicWorkingHours
} = require("../controllers/workingHoursController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, setWorkingHours);

router.get("/", authenticateToken, getWorkingHours);

router.get("/public/:barberId", getPublicWorkingHours);

module.exports = router;