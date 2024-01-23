import { ResetPasswordEmailTemplate } from "@/email-templates/reset-password-email";
import { Resend } from "resend";
import User from "@/models/User";
import crypto from "crypto";
import connectMongo from "./connectMongo";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (email) => {
    await connectMongo();

    console.log("Resetting password for " + email);

    // Check if the user exists
    const user = await User.findOne({ email: email });

    if (!user) {
        throw new Error("User not found");
    }

    console.log(email)
    console.log(user)

    const resetPasswordToken = crypto.randomBytes(32).toString("base64url");
    const today = new Date();
    const expiryDate = new Date(today.setDate(today.getDate() + 1)); // 24 hours from now

    // Update the user with the new token
    await User.findOneAndUpdate(
        { email },
        {
            $set: {
                resetPasswordToken: resetPasswordToken,
                resetPasswordTokenExpiry: expiryDate,
            },
        },
        { new: true, runValidators: true }
    );

    // Send the resend email
    await resend.emails.send({
        from: "Admin <onboarding@coleaseum.ca>",
        to: [email],
        subject: "Reset your password",
        react: ResetPasswordEmailTemplate({ email, resetPasswordToken }),
    });

    return "Password reset email sent";
};
