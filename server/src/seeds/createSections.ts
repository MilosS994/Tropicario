import mongoose from "mongoose";
import connectDB from "../config/db.js";
import "dotenv/config";
import Section from "../models/Section.js";
import User from "../models/User.js";

const sections = [
  {
    title: "Palms",
    description:
      "Everything about palm cultivation, care, and identification. From cold-hardy to tropical species.",
    order: 1,
  },
  {
    title: "Cacti",
    description:
      "Desert beauties and their secrets. Growing, propagating, and enjoying cacti in your collection.",
    order: 2,
  },
  {
    title: "Succulents",
    description:
      "Water-wise wonders for every space. Care guides, propagation tips, and stunning varieties.",
    order: 3,
  },
  {
    title: "Cycads",
    description:
      "Ancient plants for modern gardens. Learn about these living fossils and how to grow them.",
    order: 4,
  },
  {
    title: "Fruit",
    description:
      "Growing tropical and subtropical fruits at home. Mangoes, bananas, papayas, and more!",
    order: 5,
  },
  {
    title: "Vegetables",
    description:
      "Edible tropical gardening. Growing heat-loving vegetables and exotic edibles.",
    order: 6,
  },
  {
    title: "Tropical Looking Plants",
    description:
      "Create that jungle vibe! Plants that bring tropical aesthetics to any climate.",
    order: 7,
  },
  {
    title: "Gardening",
    description:
      "General gardening tips, techniques, and discussions. Soil, fertilizers, pests, and more.",
    order: 8,
  },
  {
    title: "Travel Logs",
    description:
      "Share your botanical adventures! Gardens visited, plants discovered, and travel stories.",
    order: 9,
  },
  {
    title: "Marketplace",
    description:
      "Buy, sell, and trade plants with fellow enthusiasts. Seeds, cuttings, and mature plants.",
    order: 10,
  },
];

export const seedSections = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find admin user (or create one if doesn't exist)
    let admin = await User.findOne({ role: "admin" });

    if (!admin) {
      console.log("No admin user found. Creating one...");
      admin = await User.create({
        username: "admin",
        email: "admin@tropicario.com",
        password: "Admin123!",
        role: "admin",
        isVerified: true,
      });
      console.log("Admin user created!");
    }

    // Delete existing sections
    await Section.deleteMany({});
    console.log("Deleted existing sections");

    // Create new sections
    const createdSections = await Section.create(
      sections.map((section) => ({
        ...section,
        author: admin._id,
      }))
    );

    console.log("Created sections:");
    createdSections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title} (${section.slug})`);
    });

    console.log("\n Database seeded successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database with sections:", error);
    process.exit(1);
  }
};

seedSections();
