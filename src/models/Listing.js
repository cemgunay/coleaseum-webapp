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
                cloudinaryUrl: String,
                path: String,
                preview: String,
                uniqueId: String,
            },
        ],
        location: {
            address1: { type: String },
            city: { type: String },
            countryregion: { type: String },
            postalcode: { type: String },
            stateprovince: { type: String },
            unitnumber: { type: String },
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
        },
        moveInDate: {
            type: Date,
            default: null,
        },
        moveOutDate: {
            type: Date,
            default: null,
        },
        shorterStays: {
            type: Boolean,
            default: false,
        },
        availableToView: {
            type: Boolean,
            default: true,
        },
        viewingDates: [{ type: Date }],
        expiryDate: {
            type: Date,
        },
        views: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: 100,
        },
        aboutYourPlace: {
            propertyType: { type: String, default: "" },
            privacyType: { type: String, default: "" },
        },
        basics: {
            bedrooms: [bedroomSchema],
            bathrooms: { type: Number, default: 0 },
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
            Test1: {
                type: Boolean,
                default: false,
            },
            Test2: {
                type: Boolean,
                default: false,
            },
            Test3: {
                type: Boolean,
                default: false,
            },
            Test4: {
                type: Boolean,
                default: false,
            },
            Test5: {
                type: Boolean,
                default: false,
            },
            Test6: {
                type: Boolean,
                default: false,
            },
            Test7: {
                type: Boolean,
                default: false,
            },
            Test8: {
                type: Boolean,
                default: false,
            },
            Test9: {
                type: Boolean,
                default: false,
            },
            Test10: {
                type: Boolean,
                default: false,
            },
            Test11: {
                type: Boolean,
                default: false,
            },
            Test12: {
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
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// // virtual properties
// ListingSchema.virtual("daysLeft").get(function () {
//     const now = new Date();
//     const diffTime = this.expiryDate.getTime() - now.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
// });

// virtual properties
// (rewriting with extra error handling steps bc some entries in the DB
// don't have .expiryDate anymore and were giving errors)
ListingSchema.virtual("daysLeft").get(function () {
    if (!this.expiryDate) {
        return null; // or some default value
    }
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

const ListingModel =
    mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

export default ListingModel;
