import mongoose from "mongoose";
import "dotenv/config";
import Section from "../models/Section.js";
import Thread from "../models/Thread.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const threadsData = {
  // 1. PALMS
  Palms: [
    {
      title: "Cold Hardy Palms Discussion",
      description:
        "Share your experiences with palms that can survive freezing temperatures. Trachycarpus, Rhapidophyllum, and more!",
      order: 1,
    },
    {
      title: "Coconut Palm Growing Guide",
      description:
        "Everything about growing Cocos nucifera from germination to fruiting. Tips for tropical and subtropical climates.",
      order: 2,
    },
    {
      title: "Date Palm Cultivation",
      description:
        "Phoenix dactylifera growing tips, pollination techniques, and harvest advice.",
      order: 3,
    },
    {
      title: "Indoor Palm Care",
      description:
        "Best palms for indoor growing: Chamaedorea, Howea, Rhapis. Light, water, and fertilizer requirements.",
      order: 4,
    },
    {
      title: "Palm Pests and Diseases",
      description:
        "Identifying and treating common palm problems: scale, mites, lethal yellowing, and more.",
      order: 5,
    },
    {
      title: "Rare and Unusual Palms",
      description:
        "Discuss exotic species, rare finds, and palms that are hard to grow or obtain.",
      order: 6,
    },
    {
      title: "Palm Germination Tips",
      description:
        "Seeds, stratification, heat mats, and patience. Share your germination success stories!",
      order: 7,
    },
  ],

  // 2. CACTI
  Cacti: [
    {
      title: "Astrophytum Care Guide",
      description:
        "Growing the beautiful star cacti. Soil mixes, watering schedules, and flowering tips.",
      order: 1,
    },
    {
      title: "Cactus Winter Care",
      description:
        "How to overwinter your cacti: temperature, watering, and light requirements during dormancy.",
      order: 2,
    },
    {
      title: "Grafting Cacti",
      description:
        "Techniques for grafting slow-growing or difficult species. Stock selection and aftercare.",
      order: 3,
    },
    {
      title: "San Pedro and Trichocereus",
      description:
        "Growing columnar cacti: propagation, soil, climate requirements, and flowering.",
      order: 4,
    },
    {
      title: "Mammillaria Species Discussion",
      description:
        "One of the largest cactus genera! Share your Mammillaria collection and care tips.",
      order: 5,
    },
    {
      title: "Cactus Flower Photography",
      description:
        "Show off your blooming cacti! Tips for photographing those spectacular but short-lived flowers.",
      order: 6,
    },
  ],

  // 3. SUCCULENTS
  Succulents: [
    {
      title: "Echeveria Varieties and Care",
      description:
        "The most popular rosette-forming succulents. Identification, propagation, and growing tips.",
      order: 1,
    },
    {
      title: "Succulent Propagation Methods",
      description:
        "Leaf cuttings, offsets, beheading - all the ways to multiply your collection!",
      order: 2,
    },
    {
      title: "Lithops (Living Stones)",
      description:
        "Growing these fascinating mimicry plants. Watering cycles, splitting, and common mistakes.",
      order: 3,
    },
    {
      title: "Haworthia Identification Help",
      description:
        "Post pictures of your Haworthia for ID help. Discuss H. cooperi, H. truncata, and rare hybrids.",
      order: 4,
    },
    {
      title: "Soil Mixes for Succulents",
      description:
        "Share your soil recipes! Pumice, perlite, grit ratios for different species and climates.",
      order: 5,
    },
    {
      title: "Aeonium Growing Tips",
      description:
        "Tree-like succulents with stunning rosettes. Winter growers, summer dormancy, and monocarpic species.",
      order: 6,
    },
    {
      title: "Succulent Pest Control",
      description:
        "Dealing with mealybugs, aphids, and fungus gnats. Organic and chemical solutions.",
      order: 7,
    },
  ],

  // 4. CYCADS
  Cycads: [
    {
      title: "Cycad Germination Guide",
      description:
        "From cleaning seeds to first leaf. Heat, moisture, and patience required!",
      order: 1,
    },
    {
      title: "Encephalartos Species Discussion",
      description:
        "African cycads - the most diverse genus. Share your Encephalartos collection!",
      order: 2,
    },
    {
      title: "Sago Palm (Cycas revoluta) Care",
      description:
        "The most common cycad in cultivation. Indoor and outdoor growing tips.",
      order: 3,
    },
    {
      title: "Rare Cycad Acquisitions",
      description:
        "Where to find rare species, import regulations, and conservation efforts.",
      order: 4,
    },
    {
      title: "Cycad Scale Treatment",
      description:
        "Aulacaspis scale is a serious threat. Prevention and treatment strategies.",
      order: 5,
    },
  ],

  // 5. FRUIT
  Fruit: [
    {
      title: "Mango Varieties for Home Growing",
      description:
        "Best mango cultivars for containers and small spaces. Condo, Ice Cream, Carrie, and more!",
      order: 1,
    },
    {
      title: "Growing Bananas",
      description:
        "From Dwarf Cavendish to Ice Cream banana. Planting, fertilizing, and protecting from cold.",
      order: 2,
    },
    {
      title: "Papaya Growing Success",
      description:
        "Fast-growing tropical fruit for warm climates. Male vs female plants, variety selection.",
      order: 3,
    },
    {
      title: "Dragon Fruit Cultivation",
      description:
        "Growing Hylocereus cactus for fruit production. Trellising, pollination, and harvesting.",
      order: 4,
    },
    {
      title: "Avocado Trees",
      description:
        "Growing avocados from seed vs grafted trees. Cold-hardy varieties and container growing.",
      order: 5,
    },
    {
      title: "Citrus Growing Tips",
      description:
        "Lemons, limes, oranges, and kumquats. Container culture, fertilizing, and pest management.",
      order: 6,
    },
    {
      title: "Passion Fruit Vines",
      description:
        "Passiflora edulis cultivation. Trellis systems, pruning, and increasing fruit production.",
      order: 7,
    },
    {
      title: "Tropical Fruit in Cold Climates",
      description:
        "Greenhouse growing, overwintering strategies, and cold-hardy tropical fruit varieties.",
      order: 8,
    },
  ],

  // 6. VEGETABLES
  Vegetables: [
    {
      title: "Growing Hot Peppers",
      description:
        "From jalapeños to ghost peppers. Germination, growing conditions, and harvest timing.",
      order: 1,
    },
    {
      title: "Tomato Varieties Discussion",
      description:
        "Heirloom vs hybrid, determinate vs indeterminate. Share your favorite varieties!",
      order: 2,
    },
    {
      title: "Tropical Leafy Greens",
      description:
        "Amaranth, Malabar spinach, water spinach, and other heat-loving greens.",
      order: 3,
    },
    {
      title: "Growing Taro and Yams",
      description:
        "Tropical root vegetables: planting, care, and harvest. Colocasia esculenta and more.",
      order: 4,
    },
    {
      title: "Container Vegetable Gardening",
      description:
        "Growing vegetables in pots: soil, fertilizer, watering, and variety selection.",
      order: 5,
    },
    {
      title: "Asian Vegetables",
      description:
        "Bok choy, gai lan, bitter melon, and other Asian greens. Growing tips and recipes!",
      order: 6,
    },
  ],

  // 7. TROPICAL LOOKING PLANTS
  "Tropical Looking Plants": [
    {
      title: "Hardy Bananas for Temperate Climates",
      description:
        "Musa basjoo and other cold-hardy bananas. Creating tropical looks in zone 7-9.",
      order: 1,
    },
    {
      title: "Giant Elephant Ears (Colocasia)",
      description:
        "Massive foliage for dramatic effect. Varieties, planting, and overwintering.",
      order: 2,
    },
    {
      title: "Bamboo Growing Guide",
      description:
        "Clumping vs running bamboo. Privacy screens, container growing, and containment strategies.",
      order: 3,
    },
    {
      title: "Cannas for Tropical Effect",
      description:
        "Bold foliage and bright flowers. Varieties, dividing rhizomes, and winter storage.",
      order: 4,
    },
    {
      title: "Tetrapanax (Rice Paper Plant)",
      description:
        "Huge leaves for instant jungle look. Growth rate, cold hardiness, and controlling spread.",
      order: 5,
    },
    {
      title: "Brugmansia (Angel's Trumpet)",
      description:
        "Spectacular hanging flowers and fast growth. Varieties, propagation, and overwintering.",
      order: 6,
    },
    {
      title: "Hardy Gingers",
      description:
        "Hedychium and other cold-tolerant gingers. Fragrant flowers and lush foliage.",
      order: 7,
    },
  ],

  // 8. GARDENING
  Gardening: [
    {
      title: "Soil Amendments and Fertilizers",
      description:
        "Organic vs synthetic, NPK ratios, compost, and soil testing. What works for you?",
      order: 1,
    },
    {
      title: "Integrated Pest Management",
      description:
        "Natural predators, companion planting, and safe pesticide use.",
      order: 2,
    },
    {
      title: "Watering Systems and Schedules",
      description:
        "Drip irrigation, soaker hoses, and smart controllers. Efficient water use strategies.",
      order: 3,
    },
    {
      title: "Greenhouse Growing",
      description:
        "Types of greenhouses, heating, cooling, and extending your growing season.",
      order: 4,
    },
    {
      title: "Composting Techniques",
      description:
        "Hot composting, vermicomposting, and turning kitchen waste into black gold.",
      order: 5,
    },
    {
      title: "Raised Bed Gardening",
      description:
        "Building and maintaining raised beds. Materials, soil depth, and crop rotation.",
      order: 6,
    },
    {
      title: "Garden Design Ideas",
      description:
        "Layout planning, color combinations, and creating focal points in your garden.",
      order: 7,
    },
  ],

  // 9. TRAVEL LOGS
  "Travel Logs": [
    {
      title: "Visiting Fairchild Tropical Garden",
      description:
        "Trip reports from Miami's premier botanical garden. Must-see collections and visiting tips.",
      order: 1,
    },
    {
      title: "Botanical Gardens Around the World",
      description:
        "Share your visits to famous gardens: Kew, Singapore Botanic Gardens, and more!",
      order: 2,
    },
    {
      title: "Plant Hunting in Thailand",
      description:
        "Visiting nurseries, markets, and wild habitats. Import regulations and shipping experiences.",
      order: 3,
    },
    {
      title: "Tropical Plant Nursery Reviews",
      description:
        "Share your experiences with mail-order nurseries and local plant shops.",
      order: 4,
    },
    {
      title: "Garden Tours and Open Days",
      description:
        "Private garden visits, plant society events, and garden festivals.",
      order: 5,
    },
  ],

  // 10. MARKETPLACE
  Marketplace: [
    {
      title: "Trading Palm Seeds",
      description:
        "Offer and request palm seeds. Include species, collection date, and location.",
      order: 1,
    },
    {
      title: "Succulent Cuttings Exchange",
      description:
        "Trade succulent cuttings and leaves. Great way to diversify your collection!",
      order: 2,
    },
    {
      title: "Rare Plant Sales",
      description:
        "Announce sales of uncommon species. Cycads, rare palms, and collector's items.",
      order: 3,
    },
    {
      title: "ISO (In Search Of)",
      description:
        "Looking for specific plants? Post your wishlist here and connect with sellers.",
      order: 4,
    },
    {
      title: "Shipping and Packaging Tips",
      description:
        "Best practices for mailing plants safely. Heat packs, insulation, and carrier recommendations.",
      order: 5,
    },
    {
      title: "Scam Awareness",
      description:
        "Report suspicious sellers and protect the community. Safety tips for plant trading.",
      order: 6,
    },
  ],
};

export const seedThreads = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find admin
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found. Run seedSections.ts first!");
      process.exit(1);
    }

    // Delete existing threads
    await Thread.deleteMany({});
    console.log("Deleted existing threads");

    // Get all sections
    const sections = await Section.find();

    let totalThreads = 0;

    for (const section of sections) {
      const sectionThreads =
        threadsData[section.title as keyof typeof threadsData];

      if (!sectionThreads) {
        console.log(`No threads defined for section: ${section.title}`);
        continue;
      }

      // Create threads for this section
      const createdThreads = await Thread.create(
        sectionThreads.map((thread) => ({
          ...thread,
          section: section._id,
          author: admin._id,
          isActive: true,
          topicsCount: 0,
        }))
      );

      // Update section's threadsCount
      section.threadsCount = createdThreads.length;
      await section.save();

      console.log(
        `Created ${createdThreads.length} threads for "${section.title}"`
      );
      totalThreads += createdThreads.length;
    }

    console.log(
      `\nSuccessfully created ${totalThreads} threads across ${sections.length} sections!`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error seeding threads:", error);
    process.exit(1);
  }
};

seedThreads();
