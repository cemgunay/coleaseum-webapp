import { changePassword } from "@/utils/changePassword";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { token, password } = req.body;
            const message = await changePassword(token, password);
            res.status(200).json({ message });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
