const express = require("express");
const {
  listUsers,
  verifyOrganization,
  setUserActiveStatus,
  getAnalytics,
  listAllDonations,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", listUsers);
router.patch("/users/:id/verify", verifyOrganization);
router.patch("/users/:id/status", setUserActiveStatus);
router.get("/analytics", getAnalytics);
router.get("/donations", listAllDonations);

module.exports = router;
