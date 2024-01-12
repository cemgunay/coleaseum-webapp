import Account from "@/models/Account";
import User from "@/models/User";

export default async function linkGoogleAccount(user, account) {
    console.log(account);
    const newAccount = await new Account({ account });

    await newAccount.save();

    // Check if the account is already linked in the user record
    const alreadyLinked = user.accounts.includes(newAccount._id);

    if (!alreadyLinked) {
        await User.updateOne(
            { _id: user._id },
            { $push: { accounts: newAccount._id } }
        );
    }

    return true;
}
