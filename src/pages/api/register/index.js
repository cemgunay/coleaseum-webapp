import connectMongo from "@/utils/connectMongo";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";

async function createUser(reqBody) {
    const { firstName, lastName, email, password, dateOfBirth, location } =
        reqBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        dateOfBirth,
        location,
    });

    await user.save();
    return user;
}

const handler = async (req, res) => {
    try {
        // Connect to the database
        await connectMongo();

        // Process POST request
        if (req.method === "POST") {
            let user;
            try {
                user = await createUser(req.body);
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }

            try {
                await sendVerificationEmail(user.email);
            } catch (error) {
                console.error("Email sending error:", error);
                // Decide how to handle email errors - log, notify admin, etc.
            }

            return res.status(200).json(user);
        } else if (req.method === "PUT") {
            // Verify session
            const session = await getServerSession(req, res, authOptions);

            if (!session) {
                return res
                    .status(401)
                    .json({ error: "You must be signed in." });
            }

            const { email, ...updateData } = req.body;

            // Find the user and update
            const updatedUser = await User.findOneAndUpdate(
                { email }, // filter by email
                { $set: updateData }, // update the given fields
                { new: true, runValidators: true } // options
            );

            if (!updatedUser) {
                return res.status(404).json({ error: "User not found." });
            }

            return res.status(200).json(updatedUser);
        } else {
            res.setHeader("Allow", ["GET", "POST"]); // Update this as necessary
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal Registration Error" });
    }
};

export default handler;
