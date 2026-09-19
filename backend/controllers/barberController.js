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

module.exports = {
    getBarbers
};