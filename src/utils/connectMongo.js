import mongoose from "mongoose";

// function to connect to the MongoDB client
async function connectMongo() {
    try {
        // connect the client to the server
        const { connection } = await mongoose.connect(process.env.MONGO_URI);

        // check ready state and return promise
        if (connection.readyState === 1) {
            return Promise.resolve(true);
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

export default connectMongo;
