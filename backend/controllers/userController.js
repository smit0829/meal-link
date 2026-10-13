const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Feedback = require("../models/Feedback");

// @desc  Get a user's public trust profile (used to show trust score + recent feedback)
// @route GET /api/users/:id/trust-profile
const getTrustProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name role organizationName donorType trustScore stats createdAt"
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const recentFeedback = await Feedback.find({ toUser: user._id })
    .populate("fromUser", "name role organizationName")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, user, recentFeedback });
});

// @desc  Update own profile
// @route PUT /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const editable = ["name", "phone", "address", "organizationName", "donorType"];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  });
  if (req.body.lng !== undefined && req.body.lat !== undefined) {
    req.user.location = {
      type: "Point",
      coordinates: [Number(req.body.lng), Number(req.body.lat)],
    };
  }
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { getTrustProfile, updateProfile };
