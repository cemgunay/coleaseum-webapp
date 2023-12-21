import mongoose from "mongoose";
const { Schema } = mongoose;

const AccountSchema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        provider: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: false,
        },
        providerAccountId: {
            type: String,
            required: true,
        },
        accessToken: {
            type: String,
            required: false,
        },
        expires_at: {
            type: Number,
            required: false,
        },
        scope: {
            type: String,
            required: false,
        },
        token_type: {
            type: String,
            required: false,
        },
        id_token: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const AccountModel = mongoose.models.Account || mongoose.model("Account", AccountSchema);

export default AccountModel;
