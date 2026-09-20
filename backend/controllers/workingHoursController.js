const db = require("../db");

const setWorkingHours = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time, is_working } = req.body;

        if (
            day_of_week === undefined ||
            !start_time ||
            !end_time ||
            is_working === undefined
        ) {
            return res.status(400).json({
                message: "Day, start time, end time and working status are required"
            });
        }

        if (day_of_week < 0 || day_of_week > 6) {
            return res.status(400).json({
                message: "Day of week must be between 0 and 6"
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
            `INSERT INTO working_hours
                (barber_id, day_of_week, start_time, end_time, is_working)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (barber_id, day_of_week)
             DO UPDATE SET
                start_time = EXCLUDED.start_time,
                end_time = EXCLUDED.end_time,
                is_working = EXCLUDED.is_working
             RETURNING id, barber_id, day_of_week,
                       start_time, end_time, is_working`,
            [
                barberId,
                day_of_week,
                start_time,
                end_time,
                is_working
            ]
        );

        res.status(200).json({
            message: "Working hours saved successfully",
            working_hours: result.rows[0]
        });

    } catch (error) {
        console.error("Set working hours error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getWorkingHours = async (req, res) => {
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
            `SELECT id, day_of_week, start_time, end_time, is_working
             FROM working_hours
             WHERE barber_id = $1
             ORDER BY day_of_week`,
            [barberId]
        );

        res.json({
            working_hours: result.rows
        });

    } catch (error) {
        console.error("Get working hours error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
const getPublicWorkingHours = async (req, res) => {
    try {
        const { barberId } = req.params;

        const result = await db.query(
            `SELECT day_of_week, start_time, end_time, is_working
             FROM working_hours
             WHERE barber_id = $1
             ORDER BY day_of_week`,
            [barberId]
        );

        res.json({
            working_hours: result.rows
        });

    } catch (error) {
        console.error("Get public working hours error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    setWorkingHours,
    getWorkingHours,
    getPublicWorkingHours
};