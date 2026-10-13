const User = require("../models/User");

/**
 * Food Trust Score (0-100)
 * Weighted blend of:
 *  - Completion rate (successful donations/pickups/deliveries vs cancellations)
 *  - Timeliness (on-time pickups)
 *  - Feedback rating (avg rating from counterpart users)
 *
 * Weights differ slightly by role since donors are judged mostly on
 * follow-through + quality, volunteers mostly on timeliness + delivery,
 * and NGOs mostly on reliability of pickups they request.
 */
const WEIGHTS = {
  donor: { completion: 0.4, timeliness: 0.2, rating: 0.4 },
  ngo: { completion: 0.35, timeliness: 0.35, rating: 0.3 },
  volunteer: { completion: 0.3, timeliness: 0.45, rating: 0.25 },
};

function safeRatio(numerator, denominator) {
  if (!denominator || denominator === 0) return 1; // no history yet -> neutral/optimistic
  return numerator / denominator;
}

async function recalcTrustScore(userId) {
  const user = await User.findById(userId);
  if (!user || !WEIGHTS[user.role]) return null;

  const { stats } = user;
  const w = WEIGHTS[user.role];

  const totalActivity =
    stats.totalDonations + stats.totalPickups + stats.totalDeliveries + stats.cancellations;

  const completionRatio = safeRatio(
    stats.successfulDonations + stats.totalDeliveries,
    stats.totalDonations + stats.totalPickups + stats.cancellations
  );

  const timelinessRatio = safeRatio(stats.onTimePickups, stats.totalPickups);

  const ratingRatio = stats.ratingCount > 0 ? stats.avgRating / 5 : 0.7; // neutral default

  let score =
    (completionRatio * w.completion + timelinessRatio * w.timeliness + ratingRatio * w.rating) *
    100;

  // Small activity bonus so highly active, reliable users edge above brand-new ones
  const activityBonus = Math.min(totalActivity * 0.3, 5);
  score = Math.min(100, Math.max(0, score + activityBonus));

  user.trustScore = Math.round(score);
  await user.save();
  return user.trustScore;
}

async function registerFeedback({ toUserId, rating }) {
  const user = await User.findById(toUserId);
  if (!user) return;
  const prevTotal = user.stats.avgRating * user.stats.ratingCount;
  user.stats.ratingCount += 1;
  user.stats.avgRating = (prevTotal + rating) / user.stats.ratingCount;
  await user.save();
  await recalcTrustScore(toUserId);
}

module.exports = { recalcTrustScore, registerFeedback };
