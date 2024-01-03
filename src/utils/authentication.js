import { getToken } from "next-auth/jwt";

export default async function authenticate(req, res) {
    try {
        const token = await getToken({ req });

        if (token) {
            return token;
        } else {
            res.status(401).json({
                error: "Access denied. No token provided.",
            });
            return null;
        }
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
        return null;
    }
}
