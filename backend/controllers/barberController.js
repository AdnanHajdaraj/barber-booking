const db = require("../db");

const getBarbers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                b.id,
                b.shop_name,
                b.description,
                u.name
             FROM barbers b
             JOIN users u ON b.user_id = u.id
             ORDER BY b.id`
        );

        res.json({
            barbers: result.rows
        });

    } catch (error) {
        console.error("Get barbers error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const addBarber = async (req, res) => {
    try {
        // 1. Must be a barber
        if (req.user.role !== "BARBER") {
            return res.status(403).json({
                message: "Only barbers can add other barbers"
            });
        }

        // 2. Must be an owner
        const ownerResult = await db.query(
            `SELECT id, is_owner, shop_name, description
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (ownerResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const owner = ownerResult.rows[0];

        if (!owner.is_owner) {
            return res.status(403).json({
                message: "Only the shop owner can add barbers"
            });
        }

        // 3. Validate input
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        // 4. Email must be unique
        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase()]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        // 5. Hash password (bcrypt, 10 rounds — matches your register)
        const passwordHash = await bcrypt.hash(password, 10);

        // 6. Create user: BARBER, verified, owned by the caller,
        //    inheriting the owner's shop_name and description.
        const userResult = await db.query(
            `INSERT INTO users
                (name, email, password_hash, role, email_verified,
                 owner_id, is_owner, shop_name, description)
             VALUES ($1, $2, $3, 'BARBER', true,
                     $4, false, $5, $6)
             RETURNING id, name, email, role`,
            [
                name,
                email.toLowerCase(),
                passwordHash,
                owner.id,
                owner.shop_name,
                owner.description
            ]
        );

        const newUser = userResult.rows[0];

        // 7. Create the barber profile row
        const barberResult = await db.query(
            `INSERT INTO barbers (user_id)
             VALUES ($1)
             RETURNING id`,
            [newUser.id]
        );

        res.status(201).json({
            message: "Barber added successfully",
            barber: {
                user_id: newUser.id,
                barber_id: barberResult.rows[0].id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Add barber error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already in use"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
};
module.exports = {
    getBarbers,
    addBarber
};