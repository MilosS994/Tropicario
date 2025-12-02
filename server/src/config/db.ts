import mongoose from "mongoose";
import "dotenv/config";

let URI: string;

switch (process.env.NODE_ENV) {
  case "development":
    URI = process.env.MONGO_URI_DEV as string;
    break;
  default:
    URI = process.env.MONGO_URI_PROD as string;
    break;
}

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error connecting to MongoDB:\n ${error.message}`);
    } else console.error(`An unkown error occured connecting to MongoDB`);

    process.exit(1);
  }
};

export default connectDB;
