const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");

// @desc  List all users, optionally filtered by role/verification status
// @route GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { role, isVerified } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isVerified !== undefined) query.isVerified = isVerified === "true";

  const users = await User.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc  Verify an NGO/shelter organization
// @route PATCH /api/admin/users/:id/verify
const verifyOrganization = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isVerified = true;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  Activate/deactivate a user account
// @route PATCH /api/admin/users/:id/status
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = !!isActive;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  Platform-wide analytics for the admin dashboard
// @route GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [userCounts, donationCounts, totalFeedback, avgRatingAgg, expiringSoon] =
    await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Donation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Feedback.countDocuments(),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      Donation.countDocuments({
        status: { $in: ["available", "requested", "assigned"] },
        expiryTime: { $lte: new Date(Date.now() + 3 * 60 * 60 * 1000) },
      }),
    ]);

  const deliveredAgg = await Donation.aggregate([
    { $match: { status: "delivered" } },
    { $group: { _id: null, totalServings: { $sum: "$quantity" } } },
  ]);

  res.json({
    success: true,
    analytics: {
      usersByRole: userCounts.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      donationsByStatus: donationCounts.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
      totalFeedbackEntries: totalFeedback,
      platformAvgRating: avgRatingAgg[0] ? Number(avgRatingAgg[0].avg.toFixed(2)) : null,
      donationsExpiringWithin3Hours: expiringSoon,
      totalServingsRescued: deliveredAgg[0] ? deliveredAgg[0].totalServings : 0,
    },
  });
});

// @desc  Admin view of all donations (for moderation)
// @route GET /api/admin/donations
const listAllDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({})
    .populate("donor", "name organizationName")
    .populate("requestedBy", "name organizationName")
    .populate("volunteer", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: donations.length, donations });
});

module.exports = {
  listUsers,
  verifyOrganization,
  setUserActiveStatus,
  getAnalytics,
  listAllDonations,
};
