const express = require("express");
const {
  requestDonation,
  getOpenPickups,
  acceptPickup,
  markPickedUp,
  markDelivered,
  cancelRequest,
  submitFeedback,
  getMyActivity,
} = require("../controllers/requestController");
const { protect } = require("../middleware/auth");
const { authorize, requireVerified } = require("../middleware/role");

const router = express.Router();

router.get("/mine", protect, getMyActivity);
router.get("/open-pickups", protect, authorize("volunteer"), getOpenPickups);

router.post(
  "/:donationId/request",
  protect,
  authorize("ngo"),
  requireVerified,
  requestDonation
);
router.patch("/:donationId/cancel-request", protect, authorize("ngo"), cancelRequest);

router.patch("/:donationId/accept-pickup", protect, authorize("volunteer"), acceptPickup);
router.patch("/:donationId/mark-picked-up", protect, authorize("volunteer"), markPickedUp);
router.patch("/:donationId/mark-delivered", protect, authorize("volunteer"), markDelivered);

router.post("/:donationId/feedback", protect, submitFeedback);

module.exports = router;
