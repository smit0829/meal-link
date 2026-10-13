const express = require("express");
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
} = require("../controllers/donationController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.get("/", protect, getDonations);
router.get("/:id", protect, getDonationById);
router.post("/", protect, authorize("donor"), createDonation);
router.put("/:id", protect, authorize("donor"), updateDonation);
router.patch("/:id/cancel", protect, authorize("donor", "admin"), cancelDonation);

module.exports = router;
