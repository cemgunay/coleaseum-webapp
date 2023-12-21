import Account from "@/models/Account";
import User from "@/models/User";

export default async function isGoogleAccountLinked(user, providerAccountId) {
    const account = await Account.findOne({
        userId: user._id,
        provider: "google",
        providerAccountId: providerAccountId,
    });

    console.log(1);
    console.log(user);
    console.log(2);
    console.log(account);

    // Check if the account is already linked in the user record
    const alreadyLinked = user.accounts.includes(account._id);

    console.log(3);
    console.log(alreadyLinked);

    if (!alreadyLinked) {
        await User.updateOne(
            { _id: user._id },
            { $push: { accounts: account._id } }
        );
    }

    return !!account;
}
