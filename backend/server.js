//packages
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//local imports
import connectDB from "./config/database.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import affiliateRoute from "./routes/affiliateRoute.js";

//rest object
const app = express();

//configure env
dotenv.config({ path: path.join(__dirname, ".env") });

//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

//middleware
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = new Set([
    ...(isProduction ? [] : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]),
    ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(origin)) return callback(null, true);
            const error = new Error("Origin is not allowed by CORS.");
            error.status = 403;
            return callback(error);
        },
        credentials: true,
    })
);
app.disable("x-powered-by");
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    if (isProduction) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
});
app.use(express.json({ limit: "10mb" }));
app.use(morgan(isProduction ? "combined" : "dev"));
// to send large files
app.use(
    fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 },
        abortOnLimit: true,
        safeFileNames: true,
    })
);
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
// app.use(express.static(path.join(__dirname, "../client/dist")));
//port
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.status(200).json({ service: "e-commerce-api", status: "ok" });
});
app.get("/health", (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? "ok" : "unavailable", database: databaseReady ? "connected" : "disconnected" });
});

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/affiliate", affiliateRoute);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status === 413 ? 413 : error.status || 500;
    if (!isProduction) console.error(error);
    return res.status(status).json({ success: false, message: status >= 500 ? "Internal server error." : error.message });
});

// app.use("*", function (req, res) {
//     res.sendFile(path.join(__dirname, "../client/dist/index.html"));
// });

const startServer = async () => {
    try {
        if (isProduction) {
            if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
                throw new Error("Production requires a JWT_SECRET of at least 32 bytes.");
            }
            if (process.env.PAYMENT_MODE === "fake") {
                throw new Error("PAYMENT_MODE=fake is not allowed in production.");
            }
            if (!allowedOrigins.size) throw new Error("Production requires CORS_ORIGINS to contain the frontend origin.");
        } else if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is required. Add a private secret to backend/.env.");
        }
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`API listening on port ${PORT}`);
        });
        const shutdown = (signal) => {
            console.log(`${signal} received. Closing HTTP server.`);
            server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
            setTimeout(() => process.exit(1), 10000).unref();
        };
        process.once("SIGTERM", () => shutdown("SIGTERM"));
        process.once("SIGINT", () => shutdown("SIGINT"));
    } catch (error) {
        console.error("Failed to connect to MongoDB. The server was not started.", error.message);
        process.exitCode = 1;
    }
};

startServer();
