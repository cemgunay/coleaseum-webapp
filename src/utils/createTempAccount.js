import Account from "@/models/Account";

export default async function createTempAccount(account) {
    console.log("TEMP ACCOUNT", account);

    const newAccount = new Account({
        account,
    });

    await newAccount.save();
}
