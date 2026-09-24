const express = require("express");
const {
    register,
    login,
    verifyEmail
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

const db = require("../db");

router.get("/protected", authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, name, email, role, is_owner
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "You accessed a protected route",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Protected route error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;