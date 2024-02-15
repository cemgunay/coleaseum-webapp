export default function inferZoomLevel(types) {
    if (types.includes("street_address")) {
        return 17; // Specific address
    } else if (types.includes("premise")) {
        return 18; // Specific buildings or business locations
    } else if (types.includes("point_of_interest")) {
        return 17; // Point of interest
    } else if (types.includes("route")) {
        return 16; // Street level
    } else if (types.includes("school")) {
        return 16; // Schools and other educational institutions
    } else if (types.includes("hospital")) {
        return 16; // Hospitals and medical centers
    } else if (types.includes("park")) {
        return 14; // Parks
    } else if (types.includes("amusement_park")) {
        return 14; // Amusement parks
    } else if (types.includes("university")) {
        return 15; // University campuses
    } else if (types.includes("museum")) {
        return 15; // Museums
    } else if (types.includes("shopping_mall")) {
        return 15; // Shopping malls
    } else if (types.includes("zoo")) {
        return 15; // Zoos and similar attractions
    } else if (types.includes("neighborhood")) {
        return 15; // Neighborhood level
    } else if (
        types.includes("sublocality") ||
        types.includes("sublocality_level_1")
    ) {
        return 15; // Sub-parts of cities
    } else if (types.includes("locality")) {
        return 13; // City level
    } else if (types.includes("airport")) {
        return 13; // Airports
    } else if (types.includes("natural_feature")) {
        return 12; // Large natural features
    } else if (types.includes("colloquial_area")) {
        return 12; // Commonly referred areas that aren’t official administrative areas
    } else if (types.includes("administrative_area_level_3")) {
        return 10; // Smaller administrative areas (borough, district)
    } else if (types.includes("administrative_area_level_2")) {
        return 9; // County level or equivalent
    } else if (types.includes("administrative_area_level_1")) {
        return 8; // State level
    } else if (types.includes("country")) {
        return 5; // Country level
    } else if (types.includes("political")) {
        return 6; // Generic political areas
    } else {
        return 10; // Default zoom level for other types
    }
}
