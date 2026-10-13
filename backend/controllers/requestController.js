const asyncHandler = require("express-async-handler");
const Donation = require("../models/Donation");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const { recalcTrustScore, registerFeedback } = require("../utils/trustScore");

// @desc  NGO/shelter requests an available donation
// @route POST /api/requests/:donationId/request
const requestDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (donation.status !== "available") {
    res.status(400);
    throw new Error("This donation is no longer available");
  }
  if (new Date(donation.expiryTime) <= new Date()) {
    donation.status = "expired";
    await donation.save();
    res.status(400);
    throw new Error("This donation has expired");
  }

  donation.status = "requested";
  donation.requestedBy = req.user._id;
  donation.timeline.requestedAt = new Date();
  await donation.save();

  res.json({ success: true, donation });
});

// @desc  Volunteers browse donations that have been requested and need a pickup volunteer
// @route GET /api/requests/open-pickups
const getOpenPickups = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ status: "requested", volunteer: null })
    .populate("donor", "name organizationName address phone")
    .populate("requestedBy", "name organizationName address phone")
    .sort({ expiryTime: 1 });

  res.json({ success: true, count: donations.length, donations });
});

// @desc  Volunteer accepts a pickup task
// @route PATCH /api/requests/:donationId/accept-pickup
const acceptPickup = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (donation.status !== "requested") {
    res.status(400);
    throw new Error("This donation is not awaiting a volunteer right now");
  }
  if (donation.volunteer) {
    res.status(400);
    throw new Error("A volunteer has already been assigned to this pickup");
  }

  donation.status = "assigned";
  donation.volunteer = req.user._id;
  donation.timeline.assignedAt = new Date();
  await donation.save();

  req.user.stats.totalPickups += 1;
  await req.user.save();

  res.json({ success: true, donation });
});

// @desc  Volunteer marks food as picked up from donor
// @route PATCH /api/requests/:donationId/mark-picked-up
const markPickedUp = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (!donation.volunteer || donation.volunteer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the assigned volunteer can update this pickup");
  }
  if (donation.status !== "assigned") {
    res.status(400);
    throw new Error("Donation must be in 'assigned' status to mark as picked up");
  }

  donation.status = "picked_up";
  donation.timeline.pickedUpAt = new Date();
  await donation.save();

  // Timeliness: picked up before expiry counts as on-time
  const volunteer = await User.findById(req.user._id);
  volunteer.stats.onTimePickups += new Date() <= new Date(donation.expiryTime) ? 1 : 0;
  await volunteer.save();
  await recalcTrustScore(volunteer._id);

  res.json({ success: true, donation });
});

// @desc  Volunteer marks food as delivered to NGO/shelter
// @route PATCH /api/requests/:donationId/mark-delivered
const markDelivered = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (!donation.volunteer || donation.volunteer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the assigned volunteer can update this delivery");
  }
  if (donation.status !== "picked_up") {
    res.status(400);
    throw new Error("Donation must be picked up before it can be marked delivered");
  }

  donation.status = "delivered";
  donation.timeline.deliveredAt = new Date();
  await donation.save();

  // Update stats + trust scores for donor, volunteer, and requesting NGO
  const donor = await User.findById(donation.donor);
  donor.stats.successfulDonations += 1;
  await donor.save();
  await recalcTrustScore(donor._id);

  const volunteer = await User.findById(donation.volunteer);
  volunteer.stats.totalDeliveries += 1;
  await volunteer.save();
  await recalcTrustScore(volunteer._id);

  if (donation.requestedBy) {
    await recalcTrustScore(donation.requestedBy);
  }

  res.json({ success: true, donation });
});

// @desc  NGO cancels its own request before a volunteer is assigned, food goes back to "available"
// @route PATCH /api/requests/:donationId/cancel-request
const cancelRequest = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (!donation.requestedBy || donation.requestedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only cancel your own request");
  }
  if (donation.status !== "requested") {
    res.status(400);
    throw new Error("Cannot cancel a request once a volunteer has been assigned");
  }

  donation.status = "available";
  donation.requestedBy = null;
  donation.timeline.requestedAt = undefined;
  await donation.save();

  req.user.stats.cancellations += 1;
  await req.user.save();

  res.json({ success: true, donation });
});

// @desc  Submit feedback/rating after a donation is delivered (feeds Food Trust Score)
// @route POST /api/requests/:donationId/feedback
const submitFeedback = asyncHandler(async (req, res) => {
  const { toUserId, rating, comment, context } = req.body;
  const donation = await Donation.findById(req.params.donationId);

  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (donation.status !== "delivered") {
    res.status(400);
    throw new Error("Feedback can only be left once a donation has been delivered");
  }
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  const participants = [
    donation.donor.toString(),
    donation.requestedBy ? donation.requestedBy.toString() : null,
    donation.volunteer ? donation.volunteer.toString() : null,
  ];
  if (!participants.includes(toUserId)) {
    res.status(400);
    throw new Error("toUserId must be a participant in this donation");
  }
  if (!participants.includes(req.user._id.toString())) {
    res.status(403);
    throw new Error("Only participants in this donation can leave feedback");
  }

  const feedback = await Feedback.create({
    donation: donation._id,
    fromUser: req.user._id,
    toUser: toUserId,
    rating,
    comment,
    context: context || "overall",
  });

  await registerFeedback({ toUserId, rating });

  res.status(201).json({ success: true, feedback });
});

// @desc  Get requests/donations relevant to the logged-in user (my activity feed)
// @route GET /api/requests/mine
const getMyActivity = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === "donor") filter = { donor: req.user._id };
  else if (req.user.role === "ngo") filter = { requestedBy: req.user._id };
  else if (req.user.role === "volunteer") filter = { volunteer: req.user._id };

  const donations = await Donation.find(filter)
    .populate("donor", "name organizationName trustScore")
    .populate("requestedBy", "name organizationName trustScore")
    .populate("volunteer", "name trustScore")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: donations.length, donations });
});

module.exports = {
  requestDonation,
  getOpenPickups,
  acceptPickup,
  markPickedUp,
  markDelivered,
  cancelRequest,
  submitFeedback,
  getMyActivity,
};
