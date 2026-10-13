const express = require("express");
const { getTrustProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.put("/me", protect, updateProfile);
router.get("/:id/trust-profile", protect, getTrustProfile);

module.exports = router;
