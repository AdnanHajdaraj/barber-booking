const express = require("express");
const {
    createService,
    getServices,
    updateService,
    updateServiceStatus,
    getPublicServices,
    getAllPublicServices      // <-- add this
} = require("../controllers/serviceController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createService);
router.get("/", authenticateToken, getServices);
router.put("/:id", authenticateToken, updateService);
router.patch("/:id/status", authenticateToken, updateServiceStatus);

// Public routes (no auth)
router.get("/public", getAllPublicServices);            // <-- new: ALL active services
router.get("/public/:barberId", getPublicServices);     // existing: services for one barber

module.exports = router;