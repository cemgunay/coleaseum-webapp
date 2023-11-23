export const amenitiesReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            return action.payload.amenities ?? state;
        case 'TOGGLE_AMENITY':
            return {
                ...state,
                [action.payload]: !state[action.payload],
            };
        // ... other amenity-specific actions
        default:
            return state;
    }
};
