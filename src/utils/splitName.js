import User from "@/models/User";

export default async function processSplitName(user) {
    const email = user.email;

    if (user.name || !user.firstName || !user.lastName) {
        const splitName = fullName.split(" ");
        const firstName = splitName[0];
        const lastName = splitName.slice(1).join(" ");

        // Update the user record
        await User.findOneAndUpdate(
            { email: email },
            { firstName: firstName, lastName: lastName },
            { new: true, upsert: false } // Set upsert to false to avoid creating new records
        );
    }
}
