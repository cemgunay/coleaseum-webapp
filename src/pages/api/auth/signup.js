import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectMongo from "@/utils/connectMongo";

// auth endpoint to sign up a user
export default async function handler(req, res) {
    // connect to DB
    await connectMongo();

    // switch statement for different request methods
    switch (req.method) {
        case "POST":
            try {
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
                    return res.status(400).json({ error: "That email is already in use." });
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

                // save user to DB
                await user.save();

                // send email to user (will implement soon)

                // jwt payload
                const payload = {
                    user: {
                        id: user.id,
                    },
                };

                // create jwt token
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
                    if (err) throw err;
                    res.status(200).json({ token });
                });
            } catch (error) {
                // will have to change this error message in prod, since I'm taking the
                // error message from this response and displaying it on the frontend
                // or maybe we change how it works on the frontend idk but this is gonna
                // have to be addressed eventually.
                res.status(500).json({ error: `APIError: Sign up failed.\n${error}` });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).json({ error: `Method ${req.method} Not Allowed` });
            break;
    }
}
