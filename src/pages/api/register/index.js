import connectMongo from "@/utils/connectMongo";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { NextResponse } from "next/server";

const handler = async (req, res) => {
    try {
        // Connect to the database
        await connectMongo();

        // Process POST request
        if (req.method === "POST") {
            // destructure req.body (just for convenience)
            const {
                firstName,
                lastName,
                email,
                password,
                // phoneNumber,
                dateOfBirth,
                // profilePicture,
                // about,
                location,
            } = req.body;

            // check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res
                    .status(400)
                    .json({ error: "That email is already in use." });
            }

            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // create new user object
            user = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                // phoneNumber,
                dateOfBirth,
                // profilePicture,
                // about,
                location,
            });

            await user.save();

            return res.status(200).json(user);
        }
        // Add logic for other HTTP methods (GET, PUT, etc.) here
        // ...

        // Unsupported method
        else {
            res.setHeader("Allow", ["GET", "POST"]); // Update this as necessary
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal Registration Error" });
    }
};

export default handler;
