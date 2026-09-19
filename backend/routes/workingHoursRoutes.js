const express = require("express");

const {
    setWorkingHours,
    getWorkingHours
} = require("../controllers/workingHoursController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, setWorkingHours);
router.get("/", authenticateToken, getWorkingHours);

module.exports = router;