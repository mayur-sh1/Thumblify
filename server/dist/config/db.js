"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        mongoose_1.default.connection.on("connected", () => {
            console.log("MongoDB is connected");
        });
        await mongoose_1.default.connect(process.env.MONGO_DB_URL);
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};
exports.default = connectDB;
