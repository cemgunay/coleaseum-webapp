import User from "@/models/User";
import connectMongo from "./connectMongo";

export default async function existingUserCheck(email) {
    await connectMongo();

    const user = await User.findOne({ email });
    console.log(user);
    return user;
}
