import Account from "@/models/Account";
import User from "@/models/User";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        // Handle the case where there is no session
        return res.redirect(`/auth/signin?error=AccountNotLinked`);
    }

    // Extract user ID or other needed info from the query
    const { user: userId, account: accountId } = req.query;

    console.log("USER API", userId);
    console.log("ACCOUNT API", accountId);

    // Fetch the user and account info based on the identifiers
    const existingUser = await User.findById(userId);
    const googleAccount = await Account.findOne({ accountId });

    console.log("EXISTING USER", existingUser);
    console.log("GOOGLE ACCOUNT", googleAccount);

    // Check if the account is already linked in the user record
    const alreadyLinked = existingUser.accounts.includes(googleAccount._id);

    if (!alreadyLinked) {
        await User.updateOne(
            { _id: existingUser._id },
            { $push: { accounts: googleAccount._id } }
        );
    }

    return res.redirect("/profile/account-settings");
}
