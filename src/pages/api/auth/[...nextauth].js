import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/utils/mongodbClient";
import User from "@/models/User";
import connectMongo from "@/utils/connectMongo";
import isGoogleAccountLinked from "@/utils/isGoogleAccountLinked";

export const authOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing Email or Password!");
                }

                //connect to mongo so we can perform find operation
                await connectMongo();

                // Find your user in the database using MongoDBAdapter
                const user = await User.findOne({ email: credentials.email });

                //if there are no users with matching email OR there is a user but doesn't have a password
                //this means they signed in with provider before
                if (!user || !user?.password) {
                    throw new Error("Incorrect Email or Password!");
                }

                //if there is a user check if they put in the correct password
                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!isCorrectPassword) {
                    throw new Error("Incorrect Email or Password!");
                }

                console.log(user);

                return user;
            },
        }),
    ],

    debug: process.env.NODE_ENV === "development",

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        // This callback is triggered on every sign in
        async signIn({ user, account, profile }) {
            console.log("USER: ", user);
            console.log("ACCOUNT: ", account);
            console.log("PROFILE: ", profile);

            //check if using google provider to sign in
            if (account.provider === "google") {
                //connect to mongo so we can perform find operation
                await connectMongo();

                // Check if the user already exists with the same email
                const existingUser = await User.findOne({ email: user.email });

                if (existingUser) {
                    // Check if the Google account is already linked
                    const googleAccountLinked = await isGoogleAccountLinked(
                        existingUser,
                        account.providerAccountId
                    );

                    //redirect user back to sign in with error if google account is not linked otherwise sign in
                    if (googleAccountLinked) {
                        return true;
                    } else {
                        return `/auth/signin?error=AccountNotLinked`;
                    }
                } else {
                    //create user and account
                    return true;
                }
            } else {
                // For other providers or sign-in scenarios
                return true;
            }
        },

        async jwt({ token, user }) {
            // Persist the OAuth access_token and or the user id to the token right after signin
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;

            return session;
        },
    },
};

export default NextAuth(authOptions);
