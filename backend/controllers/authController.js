const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc  Register a new user (donor, ngo, volunteer). Admins are seeded directly in DB.
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    donorType,
    organizationName,
    phone,
    address,
    lng,
    lat,
  } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error("Name, email, password and role are required");
  }

  if (!["donor", "ngo", "volunteer"].includes(role)) {
    res.status(400);
    throw new Error("Role must be one of: donor, ngo, volunteer");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    donorType: role === "donor" ? donorType : undefined,
    organizationName: role === "ngo" ? organizationName : undefined,
    phone,
    address,
    location:
      lng !== undefined && lat !== undefined
        ? { type: "Point", coordinates: [Number(lng), Number(lat)] }
        : undefined,
  });

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @desc  Login
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated. Contact support.");
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @desc  Get logged-in user's profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { registerUser, loginUser, getMe };
