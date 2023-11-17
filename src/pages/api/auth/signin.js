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
                    return res.status(400).json({ error: "Incorrect email or password." });
                }

                // compare password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ error: "Incorrect email or password." });
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
                    res.status(200).json({ token });
                });
            } catch (error) {
                // will have to change this error message in prod, since I'm taking the
                // error message from this response and displaying it on the frontend
                // or maybe we change how it works on the frontend idk but this is gonna
                // have to be addressed eventually.
                res.status(500).json({ error: `APIError: Sign in failed.\n${error}` });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).json({ error: `Method ${req.method} Not Allowed` });
            break;
    }
}
