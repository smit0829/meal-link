const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["donor", "ngo", "volunteer", "admin"],
      required: true,
    },
    // Donor-specific: type of establishment
    donorType: {
      type: String,
      enum: ["restaurant", "hotel", "marriage_hall", "hostel", "event_organizer", "other"],
    },
    organizationName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    // NGOs/shelters must be verified by admin before they can request donations
    isVerified: {
      type: Boolean,
      default: function () {
        return this.role === "donor" || this.role === "admin";
      },
    },
    isActive: { type: Boolean, default: true },

    // Food Trust Score system (0-100)
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    stats: {
      totalDonations: { type: Number, default: 0 },
      successfulDonations: { type: Number, default: 0 },
      totalPickups: { type: Number, default: 0 },
      onTimePickups: { type: Number, default: 0 },
      totalDeliveries: { type: Number, default: 0 },
      cancellations: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
