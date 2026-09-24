const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { getBarbers, addBarber } = require("../controllers/barberController");

const router = express.Router();

router.get("/", getBarbers);
router.post("/add", authenticateToken, addBarber);

module.exports = router;