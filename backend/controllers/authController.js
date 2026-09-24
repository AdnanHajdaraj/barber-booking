const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/email");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, role, email_verified, created_at`,
            [name, email, passwordHash]
        );

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await db.query(
            `INSERT INTO email_verification_tokens
                (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [
                result.rows[0].id,
                verificationToken,
                expiresAt
            ]
        );

        await sendVerificationEmail(
            email,
            verificationToken
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                email_verified: user.email_verified,
                is_owner: user.is_owner          // <-- ADDED
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required"
            });
        }

        const tokenResult = await db.query(
            `SELECT id, user_id, expires_at
             FROM email_verification_tokens
             WHERE token = $1`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid verification token"
            });
        }

        const verificationToken = tokenResult.rows[0];

        if (new Date() > new Date(verificationToken.expires_at)) {
            return res.status(400).json({
                message: "Verification token has expired"
            });
        }

        await db.query(
            `UPDATE users
             SET email_verified = true
             WHERE id = $1`,
            [verificationToken.user_id]
        );

        await db.query(
            `DELETE FROM email_verification_tokens
             WHERE id = $1`,
            [verificationToken.id]
        );

        res.json({
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Email verification error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

// ===== THIS is the function the dashboard calls =====
// If your existing /protected handler lives in a different file,
// copy this function there instead and make sure it's exported.
const protectedRoute = async (req, res) => {
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

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Protected route error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    protectedRoute    // <-- add this
};