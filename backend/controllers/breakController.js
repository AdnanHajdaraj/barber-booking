const db = require("../db");

const createBreak = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time, name } = req.body;

        if (
            day_of_week === undefined ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                message: "Day, start time and end time are required"
            });
        }

        if (day_of_week < 0 || day_of_week > 6) {
            return res.status(400).json({
                message: "Day of week must be between 0 and 6"
            });
        }

        if (start_time >= end_time) {
            return res.status(400).json({
                message: "Break start time must be before end time"
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
            `INSERT INTO breaks
                (barber_id, day_of_week, start_time, end_time, name)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, barber_id, day_of_week,
                       start_time, end_time, name`,
            [
                barberId,
                day_of_week,
                start_time,
                end_time,
                name || null
            ]
        );

        res.status(201).json({
            message: "Break created successfully",
            break: result.rows[0]
        });

    } catch (error) {
        console.error("Create break error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getBreaks = async (req, res) => {
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
            `SELECT id, day_of_week, start_time, end_time, name
             FROM breaks
             WHERE barber_id = $1
             ORDER BY day_of_week, start_time`,
            [barberId]
        );

        res.json({
            breaks: result.rows
        });

    } catch (error) {
        console.error("Get breaks error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const deleteBreak = async (req, res) => {
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
            `DELETE FROM breaks
             WHERE id = $1 AND barber_id = $2
             RETURNING id`,
            [id, barberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Break not found"
            });
        }

        res.json({
            message: "Break deleted successfully"
        });

    } catch (error) {
        console.error("Delete break error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createBreak,
    getBreaks,
    deleteBreak
};