import mongoose from "mongoose";
const { Schema } = mongoose;

const RequestStatus = Object.freeze({
    PENDINGTENANT: "pendingTenant",
    PENDINGSUBTENANT: "pendingSubTenant",
    PENDINGTENANTUPLOAD: "pendingTenantUpload",
    PENDINGSUBTENANTUPLOAD: "pendingSubTenantUpload",
    PENDINGFINALACCEPT: "pendingFinalAccept",
    CONFIRMED: "confirmed",

    PENDING: "pending",
    REJECTED: "rejected",
    ACCEPTED: "accepted",
});

const RequestSchema = new Schema(
    {
        tenantId: {
            type: String,
            required: true,
        },
        subTenantId: {
            type: String,
            required: true,
        },
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: false,
        },
        endDate: {
            type: Date,
            required: false,
        },
        viewingDate: {
            type: Date,
            required: false,
            default: null,
        },
        status: {
            type: String,
            enum: Object.values(RequestStatus),
            required: true,
            default: RequestStatus.PENDINGTENANT,
        },
        status_reason: {
            type: String,
        },
        previousStatus: {
            type: String,
            enum: Object.values(RequestStatus),
            required: false,
        },
        showTenant: {
            type: Boolean,
            default: true,
        },
        showSubTenant: {
            type: Boolean,
            default: true,
        },
        tenantDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
        subtenantDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
        tenantFinalAccept: {
            type: Boolean,
            default: false,
        },
        subtenantFinalAccept: {
            type: Boolean,
            default: false,
        },
        acceptanceTimestamp: {
            type: Date,
        },
    },
    { timestamps: true }
);

const RequestModel = mongoose.models.Request || mongoose.model("Request", RequestSchema);

export default RequestModel;
