const mongoose = require("mongoose");
require("dotenv").config();

const Admin = require("./models/Admin");
const Shop = require("./models/Shop");
const Product = require("./models/Product");

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const config = {
  adminName: process.env.SEED_ADMIN_NAME || "QuickBazaar Admin",
  adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@quickbazaar.com",
  adminPassword: process.env.SEED_ADMIN_PASSWORD || "admin123",
  city: process.env.SEED_CITY || "Mumbai",
  centerLat: toNumber(process.env.SEED_CENTER_LAT, 19.076),
  centerLng: toNumber(process.env.SEED_CENTER_LNG, 72.8777),
  radiusKm: toNumber(process.env.SEED_RADIUS_KM, 5),
};

const shopSeeds = [
  {
    name: "Downtown Bazaar",
    address: "Market Street 12",
    offset: { lat: 0.008, lng: 0.006 },
    deliveryRadiusKm: 5,
    products: [
      {
        name: "Wireless Earbuds",
        description: "Compact earbuds with clear sound and long battery life.",
        price: 49.99,
        category: "Audio",
        stock: 24,
      },
      {
        name: "Smartphone Case",
        description: "Shock-resistant case with soft grip finish.",
        price: 12.5,
        category: "Accessories",
        stock: 60,
      },
      {
        name: "LED Desk Lamp",
        description: "Adjustable brightness lamp for study and work.",
        price: 29.99,
        category: "Electronics",
        stock: 18,
      },
    ],
  },
  {
    name: "Greenleaf Market",
    address: "Lakeview Road 5",
    offset: { lat: -0.01, lng: 0.009 },
    deliveryRadiusKm: 6,
    products: [
      {
        name: "Organic Face Wash",
        description: "Gentle cleanser for daily skin care routine.",
        price: 14.25,
        category: "Beauty",
        stock: 40,
      },
      {
        name: "Yoga Mat",
        description: "Non-slip mat for workouts and stretching.",
        price: 22.0,
        category: "Sports",
        stock: 30,
      },
      {
        name: "Aroma Diffuser",
        description: "Compact diffuser with ambient lighting.",
        price: 34.75,
        category: "Home",
        stock: 12,
      },
    ],
  },
  {
    name: "Campus Store",
    address: "College Avenue 44",
    offset: { lat: 0.006, lng: -0.012 },
    deliveryRadiusKm: 4,
    products: [
      {
        name: "Canvas Backpack",
        description: "Durable backpack with padded laptop sleeve.",
        price: 39.9,
        category: "Clothing",
        stock: 22,
      },
      {
        name: "Graphic Novel Set",
        description: "Popular graphic novels bundle with 3 volumes.",
        price: 27.5,
        category: "Books",
        stock: 15,
      },
      {
        name: "Gaming Mouse",
        description: "Ergonomic mouse with adjustable DPI settings.",
        price: 24.99,
        category: "Gaming",
        stock: 35,
      },
    ],
  },
];

const upsertShop = async (adminId, seed) => {
  const lat = config.centerLat + seed.offset.lat;
  const lng = config.centerLng + seed.offset.lng;

  return Shop.findOneAndUpdate(
    { owner: adminId, name: seed.name },
    {
      name: seed.name,
      address: seed.address,
      city: config.city,
      deliveryRadiusKm: seed.deliveryRadiusKm || config.radiusKm,
      owner: adminId,
      location: { type: "Point", coordinates: [lng, lat] },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const upsertProduct = async (shopId, product) => {
  return Product.findOneAndUpdate(
    { shop: shopId, name: product.name },
    { ...product, shop: shopId },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const admin =
    (await Admin.findOne({ email: config.adminEmail })) ||
    (await Admin.create({
      name: config.adminName,
      email: config.adminEmail,
      password: config.adminPassword,
    }));

  let productCount = 0;

  for (const seed of shopSeeds) {
    const shop = await upsertShop(admin._id, seed);
    for (const product of seed.products) {
      await upsertProduct(shop._id, product);
      productCount += 1;
    }
  }

  console.log("Seed complete:");
  console.log(`- Admin: ${config.adminEmail}`);
  console.log(`- City: ${config.city}`);
  console.log(`- Shops: ${shopSeeds.length}`);
  console.log(`- Products: ${productCount}`);
  console.log("Tip: Use city search on Home with the city above.");

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
