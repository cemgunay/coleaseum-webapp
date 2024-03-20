export const ACTIVE_STATUSES = [
    "pendingSubTenant",
    "pendingTenant",
    "pendingTenantUpload",
    "pendingSubTenantUpload",
    "pendingFinalAccept",
    "pending",
];

export const PAST_STATUSES = ["rejected"];

export const CONFIRMED_STATUSES = ["accepted", "confirmed"];

// Constants for file limits and types
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MIN_FILE_SIZE = 50 * 1024; // 50 KB
export const ALLOWED_FILE_TYPES = [".jpeg", ".png"];
export const MAX_FILES = 10;
export const UPLOAD_TIMEOUT = 10000; // 10 seconds

// Example of default filter values
export const DEFAULT_FILTERS = {
    //priceMin: 0,
    //priceMax: 1000,
    bedrooms: "any",
    //beds: "any",
    bathrooms: "any",
    startDate: "2001-05-01T05:00:00.000Z",
    endDate: "2030-10-14T04:00:00.000Z",
    //coords: { lat: 43.4722854, lng: -80.5448576 }, //DEFAULT TO WATERLOO????
    //radius: "0.958172358124772",
};

// number of hours after rejected request that a user can submit a new request
export const REJECTED_REQUEST_BUFFER_HOURS = 12;

