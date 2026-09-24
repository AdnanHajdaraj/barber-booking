const db = require("../db");

const createService = async (req, res) => {
    try {
        const { name, description, price, duration } = req.body;

        if (!name || price === undefined || !duration) {
            return res.status(400).json({
                message: "Name, price and duration are required"
            });
        }

        const barberResult = await db.query(
            "SELECT id FROM barbers WHERE user_id = $1",
            [req.user.id]
        );

        if (barberResult.rows.length === 0) {
            return res.status(403).json({
                message: "You are not registered as a barber"
            });
        }

        const barberId = barberResult.rows[0].id;

        const result = await db.query(
            `INSERT INTO services
                (barber_id, name, description, price, duration)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, barber_id, name, description, price, duration, active`,
            [barberId, name, description || null, price, duration]
        );

        res.status(201).json({
            message: "Service created successfully",
            service: result.rows[0]
        });

    } catch (error) {
        console.error("Create service error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getServices = async (req, res) => {
    try {
        const barberResult = await db.query(
            "SELECT id FROM barbers WHERE user_id = $1",
            [req.user.id]
        );

        if (barberResult.rows.length === 0) {
            return res.status(403).json({
                message: "You are not registered as a barber"
            });
        }

        const barberId = barberResult.rows[0].id;

        const result = await db.query(
            `SELECT id, name, description, price, duration, active
             FROM services
             WHERE barber_id = $1
             ORDER BY id`,
            [barberId]
        );

        res.json({
            services: result.rows
        });

    } catch (error) {
        console.error("Get services error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, active } = req.body;

        if (!name || price === undefined || !duration) {
            return res.status(400).json({
                message: "Name, price and duration are required"
            });
        }

        const barberResult = await db.query(
            "SELECT id FROM barbers WHERE user_id = $1",
            [req.user.id]
        );

        if (barberResult.rows.length === 0) {
            return res.status(403).json({
                message: "You are not registered as a barber"
            });
        }

        const barberId = barberResult.rows[0].id;

        const result = await db.query(
            `UPDATE services
             SET name = $1,
                 description = $2,
                 price = $3,
                 duration = $4,
                 active = $5
             WHERE id = $6 AND barber_id = $7
             RETURNING id, barber_id, name, description, price, duration, active`,
            [
                name,
                description || null,
                price,
                duration,
                active !== undefined ? active : true,
                id,
                barberId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service updated successfully",
            service: result.rows[0]
        });

    } catch (error) {
        console.error("Update service error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (typeof active !== "boolean") {
            return res.status(400).json({
                message: "Active must be true or false"
            });
        }

        const barberResult = await db.query(
            "SELECT id FROM barbers WHERE user_id = $1",
            [req.user.id]
        );

        if (barberResult.rows.length === 0) {
            return res.status(403).json({
                message: "You are not registered as a barber"
            });
        }

        const barberId = barberResult.rows[0].id;

        const result = await db.query(
            `UPDATE services
             SET active = $1
             WHERE id = $2 AND barber_id = $3
             RETURNING id, barber_id, name, description, price, duration, active`,
            [active, id, barberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service status updated successfully",
            service: result.rows[0]
        });

    } catch (error) {
        console.error("Update service status error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getPublicServices = async (req, res) => {
    try {
        const { barberId } = req.params;

        const result = await db.query(
            `SELECT id, name, description, price, duration
             FROM services
             WHERE barber_id = $1
               AND active = true
             ORDER BY id`,
            [barberId]
        );

        res.json({
            services: result.rows
        });

    } catch (error) {
        console.error("Get public services error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getAllPublicServices = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                s.id,
                s.name,
                s.description,
                s.price,
                s.duration,
                b.id AS barber_id,
                b.shop_name,
                u.name AS barber_name
             FROM services s
             JOIN barbers b ON s.barber_id = b.id
             JOIN users u ON b.user_id = u.id
             WHERE s.active = true
             ORDER BY b.shop_name, s.name`
        );

        res.json({
            services: result.rows
        });

    } catch (error) {
        console.error("Get all public services error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createService,
    getServices,
    updateService,
    updateServiceStatus,
    getPublicServices,
    getAllPublicServices
};