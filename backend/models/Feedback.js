const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    // what aspect this feedback covers, used to weight trust score
    context: {
      type: String,
      enum: ["food_quality", "timeliness", "communication", "overall"],
      default: "overall",
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ toUser: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
