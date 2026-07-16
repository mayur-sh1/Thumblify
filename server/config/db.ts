import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB is connected");
        });
        await mongoose.connect(process.env.MONGO_DB_URL as string)
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

export default connectDB