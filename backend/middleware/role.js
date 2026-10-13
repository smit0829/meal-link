// Usage: authorize("donor", "admin")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user ? req.user.role : "guest"}' is not permitted to perform this action`);
    }
    next();
  };
};

// NGOs/shelters must be admin-verified before they can request donations
const requireVerified = (req, res, next) => {
  if (req.user.role === "ngo" && !req.user.isVerified) {
    res.status(403);
    throw new Error("Your organization is pending admin verification");
  }
  next();
};

module.exports = { authorize, requireVerified };
