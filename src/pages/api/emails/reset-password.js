import { sendResetPasswordEmail } from "@/utils/sendResetPasswordEmail";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { email } = req.body;
            const message = await sendResetPasswordEmail(email);
            res.status(200).json({ message });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}