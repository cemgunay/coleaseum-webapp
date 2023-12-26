import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            require: true,
        },
        lastName: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
        },
        resetPasswordToken: {
            type: String,
            unique: true,
        },
        resetPasswordTokenExpiry: {
            type: Date,
        },
        accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
        phoneNumber: {
            type: String,
        },
        dateOfBirth: {
            type: Date,
            required: true,
            trim: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        about: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            required: true,
        },
        idVerified: {
            type: Boolean,
        },
        favourites: {
            type: Array,
            default: [],
        },
        occupation: {
            type: String,
        },
        drinking: {
            type: Boolean,
        },
        smoking: {
            type: Boolean,
        },
        noiseLevel: {
            type: Number,
            min: 1,
            max: 100,
        },
        instagramUrl: {
            type: String,
        },
        facebookUrl: {
            type: String,
        },
        tikTokUrl: {
            type: String,
        },
        currentTenantTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            default: null,
        },
        currentSubTenantTransaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
            default: null,
        },
        passwordChangeRequired: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
