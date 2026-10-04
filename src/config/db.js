import dns from "dns";
import mongoose from "mongoose";

// حل مشكلة DNS مع MongoDB Atlas
dns.setServers(["1.1.1.1", "8.8.8.8"]);

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((error) => {
        connectionPromise = null;

        console.error(
          "MongoDB connection failed:",
          error.message
        );

        throw error;
      });
  }

  await connectionPromise;
};

export default connectDB;