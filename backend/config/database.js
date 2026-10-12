import mongoose from "mongoose";

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI?.trim();
    if (!mongoUri) {
        throw new Error("MONGODB_URI is required. Add your MongoDB connection string to backend/.env.");
    }

    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB database ${mongoose.connection.name} at ${mongoose.connection.host}`);
};

export default connectDB;
