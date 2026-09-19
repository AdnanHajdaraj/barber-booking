const express = require("express");

const {
    createDayOff,
    getDaysOff,
    deleteDayOff
} = require("../controllers/dayOffController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createDayOff);
router.get("/", authenticateToken, getDaysOff);
router.delete("/:id", authenticateToken, deleteDayOff);

module.exports = router;