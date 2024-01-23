import Account from "@/models/Account";
import User from "@/models/User";

export default async function isGoogleAccountLinked(user, providerAccountId) {
    const account = await Account.findOne({
        userId: user._id,
        provider: "google",
        providerAccountId: providerAccountId,
    });

    if (account) {
        // Check if the account is already linked in the user record
        const alreadyLinked = user.accounts.includes(account._id);

        if (!alreadyLinked) {
            await User.updateOne(
                { _id: user._id },
                { $push: { accounts: account._id } }
            );
        }
    } else {
        return false;
    }

    return !!account;
}
