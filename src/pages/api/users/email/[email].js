import connectMongo from "@/utils/connectMongo";
import User from "@/models/User";

export default async function handler(req, res) {
    // Get userEmail from query
    const { email } = req.query;

    try {
        // Connect to the database
        await connectMongo();

        // Find the user by email
        const user = await User.findOne({ email: email });

        // If no user is found, return a 404
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if a password is set
        const hasPassword = !!user.password;

        // Convert the user document to a plain JavaScript object and exclude the password
        const userObj = user.toObject();
        delete userObj.password;

        // Add the hasPassword field
        userObj.hasPassword = hasPassword;

        // Otherwise, return the found user (without the password) with a 200 status code
        res.status(200).json(userObj);
    } catch (error) {
        console.error(`Failed to retrieve user by email.\n`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
