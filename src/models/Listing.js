import mongoose from "mongoose";
const { Schema } = mongoose;

const bedroomSchema = new mongoose.Schema(
    {
        bedType: [{ type: String }],
        ensuite: { type: Boolean },
    },
    { _id: false }
);

const ListingSchema = new Schema(
    {
        userId: {
            type: String,
        },
        title: {
            type: String,
        },
        images: [
            {
                url: String,
                filename: String,
                file: Object,
                progress: Number,
            },
        ],
        location: {
            address1: { type: String },
            city: { type: String },
            countryregion: { type: String },
            postalcode: { type: String },
            stateprovince: { type: String },
            unitnumber: { type: String },
            lat: { type: Number },
            lng: { type: Number },
        },
        moveInDate: {
            type: Date,
        },
        moveOutDate: {
            type: Date,
        },
        shorterStays: {
            type: Boolean,
            default: false,
        },
        availableToView: {
            type: Boolean,
            default: true,
        },
        viewingDates: [{ type: String }],
        expiryDate: {
            type: Date,
        },
        views: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: 0,
        },
        aboutyourplace: {
            propertyType: { type: String },
            privacyType: { type: String },
        },
        basics: {
            bedrooms: [bedroomSchema],
            bathrooms: { type: Number },
        },
        amenities: {
            inUnitWasherAndDrier: {
                type: Boolean,
                default: false,
            },
            airConditioning: {
                type: Boolean,
                default: false,
            },
            petsAllowed: {
                type: Boolean,
                default: false,
            },
            furnished: {
                type: Boolean,
                default: false,
            },
            dishwasher: {
                type: Boolean,
                default: false,
            },
            fitnessCenter: {
                type: Boolean,
                default: false,
            },
            balcony: {
                type: Boolean,
                default: false,
            },
            parking: {
                type: Boolean,
                default: false,
            },
        },
        utilities: {
            hydro: {
                type: Boolean,
                default: false,
            },
            electricity: {
                type: Boolean,
                default: false,
            },
            water: {
                type: Boolean,
                default: false,
            },
            wifi: {
                type: Boolean,
                default: false,
            },
        },
        description: {
            type: String,
        },
        published: {
            type: Boolean,
            default: false,
        },
        transactionInProgress: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        bookedDates: [
            {
                startDate: Date,
                endDate: Date,
            },
        ],
        isBooked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// virtual properties
ListingSchema.virtual("daysLeft").get(function () {
    const now = new Date();
    const diffTime = this.expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

ListingSchema.virtual("numOfBedrooms").get(function () {
    return this.basics.bedrooms.length;
});

ListingSchema.set("toObject", { virtuals: true });
ListingSchema.set("toJSON", { virtuals: true });

const ListingModel = mongoose.model("Listing", ListingSchema);

module.exports = ListingModel;
