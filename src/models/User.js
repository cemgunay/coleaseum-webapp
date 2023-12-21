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
            type: Date,
        },
        password: {
            type: String,
            required: true,
            min: 6,
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

// Pre-save middleware
UserSchema.pre("save", function (next) {
    if (this.name && (!this.firstName || !this.lastName)) {
        const splitName = this.name.split(" ");
        this.firstName = splitName[0];
        this.lastName = splitName.slice(1).join(" ");
    }
    next();
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
