import User from "@/models/User";
import bcrypt from "bcryptjs";
import connectMongo from "./connectMongo";

export const changePassword = async (resetPasswordToken, newPassword) => {
    await connectMongo();

    // Find the user with the given reset password token
    const user = await User.findOne({ resetPasswordToken });

    if (!user) {
        throw new Error("User not found");
    }

    // Check if the token has expired
    const resetPasswordTokenExpiry = user.resetPasswordTokenExpiry;
    if (!resetPasswordTokenExpiry || new Date() > resetPasswordTokenExpiry) {
        throw new Error("Token expired");
    }

    // Hash the new password
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    // Update the user with the new token
    await User.updateOne(
        { _id: user._id },
        {
            $set: { password: passwordHash },
            $unset: { resetPasswordToken: "", resetPasswordTokenExpiry: "" },
        }
    );

    return "Password changed successfully";
};
