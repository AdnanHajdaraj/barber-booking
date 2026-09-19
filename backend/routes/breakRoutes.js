const express = require("express");

const {
    createBreak,
    getBreaks,
    deleteBreak
} = require("../controllers/breakController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createBreak);
router.get("/", authenticateToken, getBreaks);
router.delete("/:id", authenticateToken, deleteBreak);

module.exports = router;