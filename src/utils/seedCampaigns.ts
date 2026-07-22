import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Campaign from "../models/Campaign";

const categories = [
  "Technology",
  "Real Estate",
  "Art & Design",
  "Film & Music",
  "Gaming",
  "Community",
  "Education",
  "Sustainability",
  "Health",
  "Food & Agriculture",
];

const creators = [
  { name: "Alice Chen", email: "alice@crowdnest.com" },
  { name: "Bob Martinez", email: "bob@crowdnest.com" },
  { name: "Carol Singh", email: "carol@crowdnest.com" },
  { name: "David Kim", email: "david@crowdnest.com" },
  { name: "Emma Johnson", email: "emma@crowdnest.com" },
  { name: "Frank Okafor", email: "frank@crowdnest.com" },
  { name: "Grace Liu", email: "grace@crowdnest.com" },
  { name: "Hassan Ali", email: "hassan@crowdnest.com" },
  { name: "Iris Tanaka", email: "iris@crowdnest.com" },
  { name: "Jake Wilson", email: "jake@crowdnest.com" },
];

const campaignNames: Record<string, string[]> = {
  Technology: [
    "AI-Powered Health Monitor",
    "Smart Home Hub 2.0",
    "Open Source Robotics Kit",
    "Quantum Computing Education Platform",
    "Blockchain Supply Chain Tracker",
    "Wearable Air Quality Sensor",
    "Voice-Controlled Smart Garden",
    "Decentralized Cloud Storage",
    "AI Language Learning App",
    "Solar-Powered WiFi Mesh Network",
    "Holographic Display Prototype",
    "Autonomous Drone Delivery System",
    "Neural Interface Headband",
    "Smart Agriculture IoT System",
    "Green Energy Battery Innovation",
    "AI Music Composition Engine",
    "Next-Gen E-Ink Display",
    "Smart Water Purifier",
    "3D Printed Prosthetics Lab",
    "Edge Computing Mini Server",
  ],
  "Real Estate": [
    "Urban Micro-Apartments Fund",
    "Coastal Vacation Properties",
    "Historic Building Restoration",
    "Community Coworking Space",
    "Eco-Friendly Tiny Homes Village",
    "Rural Farm Stay Resort",
    "Student Housing Complex",
    "Rooftop Garden Apartments",
    "Mixed-Use Development Project",
    "Sustainable Office Tower",
    "Beachfront Restaurant & Lounge",
    "Mountain Retreat Cabins",
    "Affordable Housing Initiative",
    "Art District Live-Work Lofts",
    "Green Campus Expansion",
    "Senior Living Community",
    "Boutique Hotel Renovation",
    "Industrial Loft Conversion",
    "Urban Farm Integration Complex",
    "Lakefront Resort Development",
  ],
  "Art & Design": [
    "Community Mural Project",
    "Interactive Art Installation",
    "Digital Art Collective",
    "Street Art Festival",
    "Sculpture Garden Park",
    "Photography Book Publication",
    "Indie Zine Collection",
    "Glass Blowing Studio",
    "Textile Art Workshop",
    "Mixed Media Exhibition",
    "Pottery Community Workshop",
    "Neon Sign Art Gallery",
    "Kinetic Sculpture Exhibition",
    "VR Art Experience",
    "Urban Sketching Collective",
    "Ceramic Tile Mural",
    "Sound Art Installation",
    "Experimental Film Screening",
    "Printmaking Co-op Studio",
    "Public Art Trail",
  ],
  "Film & Music": [
    "Indie Feature Film",
    "Documentary: Ocean Crisis",
    "Animated Short Film",
    "Community Orchestra Album",
    "Music Festival 2026",
    "Podcast Network Launch",
    "Youth Film Academy",
    "Experimental Jazz Album",
    "Music Video Production",
    "Live Concert Recording",
    "Film Score Orchestra",
    "Stop Motion Animation",
    "Choir World Tour",
    "Vinyl Record Pressing",
    "Music Education App",
    "Documentary Series Pilot",
    "Underground Music Venue",
    "Film Restoration Project",
    "A Cappella Group Album",
    "Cinematography Workshop",
  ],
  Gaming: [
    "Indie RPG Adventure",
    "VR Horror Experience",
    "Pixel Art Platformer",
    "Board Game Production",
    "Esports Tournament Series",
    "Mobile Puzzle Game",
    "Retro Arcade Collection",
    "Tabletop RPG Rulebook",
    "Game Dev Bootcamp",
    "Narrative Visual Novel",
    "Multiplayer Strategy Game",
    "Augmented Reality Game",
    "Educational Kids Game",
    "Racing Sim Prototype",
    "Game Art Asset Library",
    "Indie Game Console",
    "Tactical War Game",
    "Life Simulator Game",
    "Rhythm Action Game",
    "Sandbox Building Game",
  ],
  Community: [
    "Community Garden Expansion",
    "Youth Mentorship Program",
    "Neighborhood Cleanup Drive",
    "Free Coding Bootcamp",
    "Community Library Renovation",
    "Local Animal Shelter Upgrade",
    "Senior Tech Literacy Classes",
    "Public Park Restoration",
    "Community Kitchen Initiative",
    "After-School Tutoring Center",
    "Homeless Outreach Program",
    "Community Theater Production",
    "Local History Museum",
    "Women's Business Incubator",
    "Community Solar Project",
    "Youth Sports League",
    "Cultural Exchange Festival",
    "Accessible Playground Build",
    "Community Bike Workshop",
    "Local Journalism Fund",
  ],
  Education: [
    "STEM Lab for Schools",
    "Online Learning Platform",
    "Children's Book Series",
    "Language Exchange Program",
    "Science Museum Exhibit",
    "Scholarship Fund Initiative",
    "Teacher Training Workshop",
    "Coding Camp for Teens",
    "Art Therapy Program",
    "Environmental Education Center",
    "VR History Lessons",
    "Math Olympiad Training",
    "Music Education Initiative",
    "Early Childhood Center",
    "Digital Literacy Program",
    "College Prep Workshop",
    "Global Classroom Project",
    "Special Needs Education Hub",
    "Adult Literacy Program",
    "Science Fair Sponsorship",
  ],
  Sustainability: [
    "Ocean Plastic Cleanup",
    "Urban Beehive Network",
    "Zero Waste Store Launch",
    "Reforestation Campaign",
    "Electric Vehicle Charging Hub",
    "Composting Community Program",
    "Sustainable Fashion Brand",
    "Rainwater Harvesting System",
    "Coral Reef Restoration",
    "Green Roof Initiative",
    "Bicycle Sharing Network",
    "Plastic-Free Packaging Project",
    "Mangrove Forest Restoration",
    "Solar Panel Installation Drive",
    "Wildlife Corridor Project",
    "Community Wind Turbine",
    "Biodegradable Product Line",
    "River Cleanup Initiative",
    "Permaculture Farm Development",
    "Carbon Offset Marketplace",
  ],
  Health: [
    "Mobile Health Clinic",
    "Mental Health App",
    "Community Fitness Center",
    "Clean Water Initiative",
    "Eye Care for All Program",
    "Maternal Health Network",
    "Telemedicine Platform",
    "Fitness Wearable Device",
    "Community Health Worker Training",
    "Nutrition Education Program",
    "Blood Donation Drive Network",
    "Accessible Wheelchair Design",
    "Dental Care Outreach",
    "Pandemic Preparedness Kit",
    "Health Insurance for Artists",
    "Senior Wellness Program",
    "Yoga & Meditation Center",
    "Community Pharmacy Project",
    "First Aid Training Network",
    "Health Data Privacy Tool",
  ],
  "Food & Agriculture": [
    "Vertical Farm Startup",
    "Community Supported Agriculture",
    "Organic Seed Bank",
    "Farm-to-Table Restaurant",
    "Urban Hydroponics Lab",
    "Beekeeping Cooperative",
    "Food Truck Collective",
    "Grain Mill Restoration",
    "Community Food Forest",
    "Aquaponics Research Center",
    "Indigenous Seed Preservation",
    "Sustainable Fishing Project",
    "Mushroom Farming Initiative",
    "Heritage Breed Livestock",
    "School Lunch Program",
    "Fermentation Workshop Space",
    "Agricultural Drone Mapping",
    "Regenerative Farm Training",
    "Community Composting Hub",
    "Zero-Mile Food Delivery",
  ],
};

const descriptions = [
  "Join us in bringing this vision to life. Your support makes a real difference in our community.",
  "We're building something extraordinary — and we need your help to make it happen.",
  "With your backing, we can turn this dream into reality. Every contribution counts.",
  "This project will transform how people interact with our community. Be part of the change.",
  "Our team has been working tirelessly on this. Now we need the community's support to launch.",
  "A bold initiative that will create lasting impact. Your contribution powers progress.",
  "Together, we can build something that future generations will thank us for.",
  "Innovation starts with support. Help us pioneer the future of this industry.",
  "This is more than a project — it's a movement. Join us and make your mark.",
  "From concept to reality: your funding bridges the gap between idea and impact.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * daysFromNow) + 30);
  return d;
}

function generateCampaigns(count: number) {
  const campaigns = [];
  for (let i = 0; i < count; i++) {
    const category = pick(categories);
    const creator = pick(creators);
    const goal = Math.floor(Math.random() * 49500) + 500; // 500 - 50000
    const raised = Math.floor(Math.random() * goal * 1.1); // 0 to 110% of goal

    campaigns.push({
      campaign_title: pick(campaignNames[category]),
      creator_name: creator.name,
      creator_email: creator.email,
      deadline: randomDate(180),
      funding_goal: goal,
      amount_raised: Math.min(raised, goal),
      description: pick(descriptions),
      category,
      image: "",
      status: "approved",
    });
  }
  return campaigns;
}

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  // Clear existing campaigns
  await Campaign.deleteMany({});
  console.log("Cleared existing campaigns");

  const campaigns = generateCampaigns(100);
  await Campaign.insertMany(campaigns);
  console.log(`Seeded ${campaigns.length} campaigns`);

  await mongoose.disconnect();
  console.log("Done!");
}

seed();
