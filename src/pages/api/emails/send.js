import { sendVerificationEmail } from "@/utils/sendVerificationEmail";

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { email } = req.body; // Assuming the user object is passed in the request body

            // Use the sendVerificationEmail function
            await sendVerificationEmail(email);

            res.status(200).json({ message: "Email sent successfully" });
        } catch (error) {
            console.error("Email sending error:", error);
            res.status(500).json({ error: "Failed to send email" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
