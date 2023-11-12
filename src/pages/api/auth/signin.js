import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectMongo from "@/utils/connectMongo";

export default async function handler(req, res) {
    // connect to DB
    await connectMongo();

    switch (req.method) {
        case "POST":
            try {
                const { email, password } = req.body;

                // check if user exists
                let user = await User.findOne({ email });
                if (!user) {
                    return res.status(400).json({ success: false, message: "Invalid Credentials" });
                }

                // compare password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ success: false, message: "Invalid Credentials" });
                }

                // jwt payload
                const payload = {
                    user: {
                        id: user.id,
                    },
                };

                // create, sign and return token
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
                    if (err) throw err;
                    res.status(200).json({ success: true, token });
                });
            } catch (error) {
                res.status(400).json({ success: false });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}
