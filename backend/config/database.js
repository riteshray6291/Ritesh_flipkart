import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecommerce";
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(
            `Connected to MongoDB database ${mongoose.connection.host}`
        );
    } catch (error) {
        console.log(
            "MongoDB Atlas connection failed; trying local in-memory database..."
        );

        try {
            const mongoMemoryServer = await MongoMemoryServer.create();
            const mongoUri = mongoMemoryServer.getUri();
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log(
                `Connected to in-memory MongoDB database at ${mongoUri}`
            );
        } catch (memoryError) {
            console.error("Database connection failed:", memoryError);
            process.exit(1);
        }
    }
};

export default connectDB;
