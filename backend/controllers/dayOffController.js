const db = require("../db");

const createDayOff = async (req, res) => {
    try {
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({
                message: "Date is required"
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
            `INSERT INTO days_off
                (barber_id, date, reason)
             VALUES ($1, $2, $3)
             RETURNING id, barber_id, date, reason`,
            [barberId, date, reason || null]
        );

        res.status(201).json({
            message: "Day off created successfully",
            day_off: result.rows[0]
        });

    } catch (error) {
        console.error("Create day off error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This date is already marked as a day off"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getDaysOff = async (req, res) => {
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
            `SELECT id, date::text AS date, reason
             FROM days_off
             WHERE barber_id = $1
             ORDER BY date`,
            [barberId]
        );

        res.json({
            days_off: result.rows
        });

    } catch (error) {
        console.error("Get days off error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const deleteDayOff = async (req, res) => {
    try {
        const { id } = req.params;

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
            `DELETE FROM days_off
             WHERE id = $1 AND barber_id = $2
             RETURNING id`,
            [id, barberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Day off not found"
            });
        }

        res.json({
            message: "Day off deleted successfully"
        });

    } catch (error) {
        console.error("Delete day off error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createDayOff,
    getDaysOff,
    deleteDayOff
};