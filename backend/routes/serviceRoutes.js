const express = require("express");
const {
    createService,
    getServices,
    updateService,
    updateServiceStatus,
    getPublicServices
} = require("../controllers/serviceController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createService);
router.get("/", authenticateToken, getServices);
router.put("/:id", authenticateToken, updateService);
router.patch("/:id/status", authenticateToken, updateServiceStatus);

router.get("/public/:barberId", getPublicServices);
module.exports = router;