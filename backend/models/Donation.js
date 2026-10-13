const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    foodType: {
      type: String,
      enum: ["veg", "non_veg", "mixed", "bakery", "packaged", "beverages", "other"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: {
      type: String,
      enum: ["servings", "kg", "plates", "packets", "liters"],
      default: "servings",
    },

    preparedAt: { type: Date, default: Date.now },
    expiryTime: { type: Date, required: true }, // safe-to-eat-until

    pickupAddress: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    images: [{ type: String }],
    safetyNotes: { type: String, trim: true },

    status: {
      type: String,
      enum: [
        "available",   // just posted
        "requested",   // an NGO/shelter has requested it
        "assigned",    // a volunteer has been assigned for pickup
        "picked_up",   // volunteer collected from donor
        "delivered",   // volunteer delivered to NGO/shelter
        "expired",     // passed expiry without being claimed
        "cancelled",   // donor cancelled
      ],
      default: "available",
    },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // NGO/shelter
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    timeline: {
      requestedAt: Date,
      assignedAt: Date,
      pickedUpAt: Date,
      deliveredAt: Date,
      cancelledAt: Date,
    },
  },
  { timestamps: true }
);

donationSchema.index({ location: "2dsphere" });
donationSchema.index({ status: 1, expiryTime: 1 });

module.exports = mongoose.model("Donation", donationSchema);
