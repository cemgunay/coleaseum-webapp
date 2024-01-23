import { VerifyEmailTemplate } from "@/email-templates/verify-email";
import { Resend } from "resend";
import User from "@/models/User";
import crypto from "crypto";
import connectMongo from "./connectMongo";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email) {

    await connectMongo()

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        const emailVerificationToken = crypto
            .randomBytes(32)
            .toString("base64url");

        // Update the user with the new token
        await User.findOneAndUpdate(
            { email },
            { $set: { emailVerificationToken: emailVerificationToken } },
            { new: true, runValidators: true }
        );

        // Send the verification email
        await resend.emails.send({
            from: "Admin <onboarding@coleaseum.ca>",
            to: [email],
            subject: "Welcome to Coleaseum",
            react: VerifyEmailTemplate({
                email: email,
                emailVerificationToken,
            }),
        });

        return "Email sent successfully";
    } catch (error) {
        console.error("sendVerificationEmail error:", error);
        throw error; // Or handle it as per your application's error handling strategy
    }
}
