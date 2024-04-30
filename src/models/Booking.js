import mongoose from "mongoose";
const { Schema } = mongoose;

const BookingSchema = new Schema(
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
            type: String,
            required: true,
        },
        acceptedRequestId: {
            type: String,
            required: true,
        },
        acceptedPrice: {
            type: Number,
            required: true,
        },
        moveInDate: {
            type: Date,
            required: true,
        },
        moveOutDate: {
            type: Date,
            required: true,
        },
        viewingDate: {
            type: Date,
        },
        depositAmount: {
            type: Number,
        },
        tenantDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
        subtenantDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    },
    { timestamps: true }
);

const BookingModel = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

export default BookingModel;
