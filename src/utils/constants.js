export const ACTIVE_STATUSES = [
    "pendingSubTenant",
    "pendingTenant",
    "pendingTenantUpload",
    "pendingSubTenantUpload",
    "pendingFinalAccept",
];

export const PAST_STATUSES = ["rejected"];

export const CONFIRMED_STATUSES = ["accepted", "confirmed"];

// Constants for file limits and types
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MIN_FILE_SIZE = 50 * 1024; // 50 KB
export const ALLOWED_FILE_TYPES = [".jpeg", ".png"];
export const MAX_FILES = 10;
export const UPLOAD_TIMEOUT = 10000; // 10 seconds
