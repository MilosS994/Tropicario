import mongoose from "mongoose";
import connectDB from "../config/db.js";
import "dotenv/config";
import Thread from "../models/Thread.js";
import Topic from "../models/Topic.js";
import User from "../models/User.js";

const topicsByThreadTitle: Record<
  string,
  Array<{ title: string; content: string }>
> = {
  // PALMS
  "Cold Hardy Palms Discussion": [
    {
      title: "Trachycarpus fortunei in Zone 7 - Winter Protection Tips",
      content:
        "I've been growing Trachycarpus fortunei (Windmill Palm) in zone 7b for 3 years now. During winter, I wrap the crown with burlap and mulch heavily around the base. Last winter we hit -10°C and it survived without any damage! The key is good drainage and protection from cold winds. Has anyone else tried this approach?",
    },
    {
      title: "Rhapidophyllum hystrix - The Needle Palm Success Story",
      content:
        "Just wanted to share my success with Rhapidophyllum hystrix (Needle Palm). This is hands down the most cold-hardy palm you can grow. Mine survived -18°C last winter in zone 6b with zero protection! Growth is slow but steady. If you're in a cold climate and want a palm, this is your best bet.",
    },
    {
      title: "Sabal minor in Northern Climates",
      content:
        "Has anyone successfully grown Sabal minor in zone 7 or colder? I'm considering planting one this spring. I've read they can handle temperatures down to -15°C when established. Would love to hear experiences from northern growers!",
    },
  ],

  "Coconut Palm Growing Guide": [
    {
      title: "Germinating Coconuts - My Method",
      content:
        "After many failed attempts, I finally figured out the best way to germinate coconuts. Use fresh nuts (less than 2 months old), place horizontally in well-draining soil mix, keep at 28-30°C with high humidity. First sprout appeared after 3 months! Patience is key with coconuts.",
    },
    {
      title: "Coconut Palm Fertilizer Schedule",
      content:
        "What fertilizer schedule do you use for coconuts? I'm currently using 8-2-12 palm fertilizer every 3 months plus micronutrients. My palms are showing good growth but I'm wondering if I should increase frequency. Zone 11 coastal planting.",
    },
  ],

  // CACTI
  "Astrophytum Care Guide": [
    {
      title: "My Astrophytum asterias Just Bloomed!",
      content:
        "So excited! My 4-year-old Astrophytum asterias finally produced its first flower - a beautiful yellow bloom. I've been growing it in 70% pumice mix, watering every 2-3 weeks in summer, and keeping it completely dry in winter. The wait was worth it!",
    },
    {
      title: "Best Soil Mix for Astrophytum?",
      content:
        "What's your go-to soil mix for Astrophytum? I'm currently using 60% inorganic (pumice, perlite, grit) and 40% organic (cactus soil). Plants seem happy but I'm wondering if I should go even more mineral-heavy, especially for A. asterias. Thoughts?",
    },
    {
      title: "Astrophytum Grafting Success",
      content:
        "Successfully grafted Astrophytum asterias 'Super Kabuto' onto Hylocereus stock yesterday. Used the rubber band method. Hoping for good results as these slow-growing varieties really benefit from grafting. Will update in a few weeks!",
    },
  ],

  "San Pedro and Trichocereus": [
    {
      title: "San Pedro Growth Rate - What to Expect?",
      content:
        "Planted a 12-inch San Pedro cutting last spring. It's now 24 inches tall - is this normal growth rate? I'm in zone 9b, full sun, watering weekly in summer. The growth has been impressive but want to make sure I'm not overdoing anything.",
    },
    {
      title: "Trichocereus bridgesii vs pachanoi - Differences?",
      content:
        "Can someone explain the main differences between T. bridgesii and T. pachanoi? I know bridgesii tends to be more blue-green with longer spines, but are there other notable differences in growth habits or care requirements?",
    },
  ],

  // SUCCULENTS
  "Echeveria Varieties and Care": [
    {
      title: "Echeveria 'Lola' Turning Pink!",
      content:
        "My Echeveria 'Lola' has developed the most stunning pink coloring after I moved it to full sun. The stress colors are incredible! Has anyone else noticed dramatic color changes with this variety? I'm using terracotta pots and watering every 10 days.",
    },
    {
      title: "Etiolated Echeveria - Can I Save It?",
      content:
        "My Echeveria stretched badly over winter due to insufficient light. The rosette is now on a long stem. Should I behead it and re-root? Or will it compact again once I move it outside for summer? Looking for advice from experienced growers.",
    },
    {
      title: "Best Echeveria for Beginners?",
      content:
        "New to succulents and want to start with Echeveria. Which varieties are most forgiving for beginners? I've heard 'Perle von Nurnberg' is tough and beautiful. Any other recommendations for someone just starting out?",
    },
  ],

  "Lithops (Living Stones)": [
    {
      title: "Help! My Lithops is Splitting",
      content:
        "My Lithops is splitting for the first time and I'm not sure what to do. Should I continue my normal watering schedule or stop watering completely? The old leaves are starting to wrinkle but the new leaves are visible inside. First time grower here!",
    },
    {
      title: "Lithops Watering Cycle Explained",
      content:
        "After killing several Lithops by overwatering, I finally understand the cycle. No water during splitting (winter/spring), light watering after old leaves are paper-thin, regular watering in growing season (summer/fall). The key is patience! Share your watering schedule!",
    },
  ],

  // FRUIT
  "Mango Varieties for Home Growing": [
    {
      title: "Ice Cream Mango Fruiting in a Pot!",
      content:
        "My 'Ice Cream' mango in a 25-gallon pot just set fruit for the first time! Planted 3 years ago, kept it on the patio, brought inside during winter. Used flowering fertilizer and it worked! The fruit is still small but I'm so excited. Container growing really works!",
    },
    {
      title: "Carrie vs Ice Cream - Which to Choose?",
      content:
        "I have space for one more mango tree and can't decide between 'Carrie' and 'Ice Cream'. Both are dwarf varieties suitable for containers. 'Carrie' has great disease resistance, but 'Ice Cream' has amazing flavor. Which would you pick and why?",
    },
    {
      title: "Mango Tree Not Flowering - What Am I Doing Wrong?",
      content:
        "My 5-year-old mango tree is healthy and growing well but hasn't flowered yet. I'm in zone 10a, the tree gets full sun, and I fertilize regularly. Do I need to use a special flowering fertilizer? Or maybe reduce nitrogen? Any advice appreciated!",
    },
  ],

  "Dragon Fruit Cultivation": [
    {
      title: "DIY Dragon Fruit Trellis Design",
      content:
        "Just built a trellis system for my dragon fruit using T-posts and wire. Made it 6 feet tall with cross supports every 18 inches. Cost less than $50 and it's rock solid. The plants are already climbing! Can share photos if anyone is interested.",
    },
    {
      title: "Dragon Fruit Not Setting Fruit - Pollination Issues?",
      content:
        "My dragon fruit flowered beautifully but no fruit set. I think it might be a pollination issue. Do I need multiple plants for cross-pollination? Or should I try hand pollinating? The flowers only last one night which makes timing tricky.",
    },
  ],

  // GARDENING
  "Soil Amendments and Fertilizers": [
    {
      title: "Composting 101 - My Setup",
      content:
        "Started composting 6 months ago and just harvested my first batch of black gold! Using a simple 3-bin system: one for fresh materials, one for turning, one for finished compost. Key lessons: keep it moist, turn weekly, balance greens and browns. Game changer for my garden!",
    },
    {
      title: "Fish Emulsion vs Seaweed Fertilizer",
      content:
        "I've been using fish emulsion for years but recently tried liquid seaweed fertilizer. The seaweed seems to give better results for root development and plant vigor. Anyone else noticed this? Curious about the science behind why seaweed works so well.",
    },
  ],

  "Greenhouse Growing": [
    {
      title: "Heating My Greenhouse in Winter",
      content:
        "What's everyone using to heat greenhouses in winter? I'm in zone 6 and considering options. Electric heaters are expensive to run, propane requires ventilation, and I've heard mixed things about thermal mass systems. Looking for cost-effective solutions!",
    },
    {
      title: "Greenhouse Ventilation - Automatic vs Manual",
      content:
        "Installed automatic vent openers in my greenhouse last spring and they've been fantastic! Temperature stays much more stable now. Cost about $60 for two openers. Best upgrade I've made. They use wax cylinders that expand with heat - no electricity needed!",
    },
  ],
};

export const seedTopics = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find admin user
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found!");
      process.exit(1);
    }

    // Delete existing topics
    await Topic.deleteMany({});
    console.log("Deleted existing topics");

    // Get all threads
    const allThreads = await Thread.find();
    console.log(`Found ${allThreads.length} threads`);

    let totalTopicsCreated = 0;

    // Create topics for specific threads
    for (const thread of allThreads) {
      const topicsData = topicsByThreadTitle[thread.title];

      if (!topicsData || topicsData.length === 0) {
        continue; // Skip threads without defined topics
      }

      console.log(`\nCreating topics for: "${thread.title}"`);

      for (const topicData of topicsData) {
        try {
          const topic = await Topic.create({
            title: topicData.title,
            content: topicData.content,
            thread: thread._id,
            author: admin._id,
            section: thread.section,
          });

          totalTopicsCreated++;
          console.log(`Created: "${topicData.title}"`);
        } catch (error: any) {
          console.log(`Failed to create topic: ${error.message}`);
        }
      }

      // Update thread's topicsCount
      const topicCount = await Topic.countDocuments({ thread: thread._id });
      thread.topicsCount = topicCount;
      thread.lastActivityAt = new Date();
      await thread.save();

      console.log(`Updated thread with ${topicCount} topics`);
    }

    console.log(`\n Successfully created ${totalTopicsCreated} topics!`);
    console.log(
      `Topics distributed across ${
        Object.keys(topicsByThreadTitle).length
      } threads`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding topics:", error);
    process.exit(1);
  }
};

seedTopics();
