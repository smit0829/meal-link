// Run with: npm run seed
// Creates one demo account per role so you can log in immediately.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const demoUsers = [
  {
    name: "Admin",
    email: "admin@meallink.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Green Leaf Restaurant",
    email: "donor@meallink.com",
    password: "donor123",
    role: "donor",
    donorType: "restaurant",
    address: "12 MG Road, Ahmedabad",
    location: { type: "Point", coordinates: [72.5714, 23.0225] },
  },
  {
    name: "Hope Shelter Trust",
    email: "ngo@meallink.com",
    password: "ngo123",
    role: "ngo",
    organizationName: "Hope Shelter Trust",
    address: "45 Ashram Road, Ahmedabad",
    location: { type: "Point", coordinates: [72.58, 23.03] },
    isVerified: true,
  },
  {
    name: "Rahul Volunteer",
    email: "volunteer@meallink.com",
    password: "volunteer123",
    role: "volunteer",
    address: "Navrangpura, Ahmedabad",
    location: { type: "Point", coordinates: [72.56, 23.03] },
  },
];

(async () => {
  await connectDB();
  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`Skipping ${u.email} (already exists)`);
      continue;
    }
    await User.create(u);
    console.log(`Created ${u.role}: ${u.email} / ${u.password || "(see script)"}`);
  }
  console.log("Seeding complete.");
  await mongoose.connection.close();
  process.exit(0);
})();
