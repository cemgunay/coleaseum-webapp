import mongoose from "mongoose";

let isConnected;

async function connectMongo() {
    // Check if we have a connection to the database or if it's currently connecting or disconnecting (readyState 1, 2 and 3)
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    // If not connected, connect to the database
    if (!isConnected) {
        try {
            const db = await mongoose.connect(process.env.MONGO_URI);
            isConnected = db.connections[0].readyState;
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            throw error; // Rethrow the error for further handling if necessary
        }
    }
}

export default connectMongo;



