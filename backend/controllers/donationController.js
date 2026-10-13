const asyncHandler = require("express-async-handler");
const Donation = require("../models/Donation");

// @desc  Donor creates a new surplus food donation
// @route POST /api/donations
const createDonation = asyncHandler(async (req, res) => {
  const {
    foodType,
    title,
    description,
    quantity,
    unit,
    expiryTime,
    pickupAddress,
    lng,
    lat,
    safetyNotes,
    images,
  } = req.body;

  if (!foodType || !title || !quantity || !expiryTime || !pickupAddress) {
    res.status(400);
    throw new Error("foodType, title, quantity, expiryTime and pickupAddress are required");
  }

  if (new Date(expiryTime) <= new Date()) {
    res.status(400);
    throw new Error("expiryTime must be in the future");
  }

  const donation = await Donation.create({
    donor: req.user._id,
    foodType,
    title,
    description,
    quantity,
    unit,
    expiryTime,
    pickupAddress,
    location:
      lng !== undefined && lat !== undefined
        ? { type: "Point", coordinates: [Number(lng), Number(lat)] }
        : undefined,
    safetyNotes,
    images: images || [],
  });

  req.user.stats.totalDonations += 1;
  await req.user.save();

  res.status(201).json({ success: true, donation });
});

// @desc  Browse/discover donations with filters (status, foodType, near location, expiring soon)
// @route GET /api/donations
const getDonations = asyncHandler(async (req, res) => {
  const { status, foodType, lng, lat, maxDistanceKm, expiringWithinHours, donor } = req.query;

  const query = {};
  if (status) query.status = status;
  if (foodType) query.foodType = foodType;
  if (donor) query.donor = donor;

  if (expiringWithinHours) {
    const cutoff = new Date(Date.now() + Number(expiringWithinHours) * 60 * 60 * 1000);
    query.expiryTime = { $gte: new Date(), $lte: cutoff };
  }

  if (lng && lat) {
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: (Number(maxDistanceKm) || 10) * 1000,
      },
    };
  }

  const donations = await Donation.find(query)
    .populate("donor", "name organizationName donorType trustScore phone address")
    .populate("requestedBy", "name organizationName trustScore")
    .populate("volunteer", "name phone trustScore")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: donations.length, donations });
});

// @desc  Get single donation
// @route GET /api/donations/:id
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate("donor", "name organizationName donorType trustScore phone address")
    .populate("requestedBy", "name organizationName trustScore phone address")
    .populate("volunteer", "name phone trustScore");

  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  res.json({ success: true, donation });
});

// @desc  Donor updates their own donation (only while still available)
// @route PUT /api/donations/:id
const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (donation.donor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit your own donations");
  }
  if (donation.status !== "available") {
    res.status(400);
    throw new Error("Cannot edit a donation once it has been requested");
  }

  const editableFields = [
    "title",
    "description",
    "quantity",
    "unit",
    "expiryTime",
    "pickupAddress",
    "safetyNotes",
    "images",
    "foodType",
  ];
  editableFields.forEach((f) => {
    if (req.body[f] !== undefined) donation[f] = req.body[f];
  });

  await donation.save();
  res.json({ success: true, donation });
});

// @desc  Donor cancels a donation
// @route PATCH /api/donations/:id/cancel
const cancelDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) {
    res.status(404);
    throw new Error("Donation not found");
  }
  if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only cancel your own donations");
  }
  if (["picked_up", "delivered"].includes(donation.status)) {
    res.status(400);
    throw new Error("Cannot cancel a donation that has already been picked up or delivered");
  }

  donation.status = "cancelled";
  donation.timeline.cancelledAt = new Date();
  await donation.save();

  req.user.stats.cancellations += 1;
  await req.user.save();

  res.json({ success: true, donation });
});

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
};
