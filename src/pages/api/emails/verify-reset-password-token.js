import User from "@/models/User";
import connectMongo from "@/utils/connectMongo";

export default async function handler(req, res) {
    await connectMongo();

    if (req.method === "POST") {
        try {
            const { token } = req.body;

            const user = await User.findOne({ resetPasswordToken: token });

            if (!user) {
                return res.status(400).json({ message: "Invalid token" });
            }

            res.status(200).json({
                message: "Reset token verified successfully",
            });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
