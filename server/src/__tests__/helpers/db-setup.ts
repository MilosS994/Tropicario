import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer | null = null;

// Connect DB
export const connectDB = async () => {
  //   Check if already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

// Disconnect DB
export const disconnectDB = async () => {
  // Check if connected before disconnect
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Clear database
export const clearDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections: any = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};
