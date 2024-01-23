import User from "@/models/User";
import connectMongo from "@/utils/connectMongo";

import pusher from "@/utils/pusher";

export default async function handler(req, res) {
    await connectMongo();

    if (req.method === "POST") {
        try {
            const { token } = req.body;
            const user = await User.findOne({ emailVerificationToken: token });

            if (!user) {
                return res.status(400).json({ message: "Invalid token or user email has already been verified" });
            }

            user.emailVerified = true;
            user.emailVerificationToken = null;
            await user.save();

            // Trigger a Pusher event
            pusher.trigger("verify-email", "email-verified", {
                verified: true,
            });

            res.status(200).json({ message: "Email verified successfully" });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
