import connectMongo from "./connectMongo";

export default async function linkGoogleAccountToUser(existingUser, account) {
    // Check if the user already has this account linked

    await connectMongo();

    const googleAccountLinked = existingUser.accounts.some(
        (acc) =>
            acc.provider === "google" &&
            acc.providerAccountId === account.providerAccountId
    );

    if (!googleAccountLinked) {
        // Link Google account to the existing user account
        existingUser.accounts.push({
            provider: account.provider,
            type: account.type,
            providerAccountId: account.providerAccountId,
            accessToken: account.accessToken,
            expires_at: account.expires_at,
            scope: account.scope,
            token_type: account.token_type,
            id_token: account.id_token,
        });
        await existingUser.save();
    }

    // Sign-in is successful
    return true;
}
