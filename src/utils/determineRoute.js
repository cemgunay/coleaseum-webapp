// Enumerations for form steps
const FORM_STEPS = {
    ABOUT_YOUR_PLACE: "about-your-place",
    LOCATION: "location",
    BASICS: "basics",
    AMENITIES: "amenities",
    IMAGES: "images",
    TITLE: "title",
    DESCRIPTION: "description",
    PRICE: "price",
    DATES: "dates",
    PUBLISH: "publish",
};

// Helper function to check listing completeness
function checkListingCompleteness(listing) {

    if (
        !listing.aboutYourPlace.propertyType ||
        !listing.aboutYourPlace.privacyType
    ) {
        return FORM_STEPS.ABOUT_YOUR_PLACE;
    }
    if (!listing.location.address1) {
        return FORM_STEPS.LOCATION;
    }
    if (listing.basics.bedrooms.length === 0) {
        return FORM_STEPS.BASICS;
    }
    if (listing.images.length < 3) {
        return FORM_STEPS.IMAGES;
    }
    if (!listing.title) {
        return FORM_STEPS.TITLE;
    }
    if (!listing.description) {
        return FORM_STEPS.DESCRIPTION;
    }
    if (!listing.priceChanged) {
        return FORM_STEPS.PRICE;
    }
    if (!listing.moveInDate || !listing.moveOutDate) {
        return FORM_STEPS.DATES;
    }
    return FORM_STEPS.PUBLISH;
}

export function determineRoute(listing, currentRoute) {
    // Split the path and check if the last segment is 'preview'
    const pathSegments = currentRoute.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment === "preview" || lastSegment === "edit") {
        return; // Do nothing if the last segment is 'preview'
    }

    const nextStepKey = checkListingCompleteness(listing);

    if (nextStepKey) {
        // Map the step key to a route
        return `/host/create-listing/${listing._id}/${nextStepKey}`;
    }
}
