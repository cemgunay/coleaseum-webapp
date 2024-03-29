export const amenitiesReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            return action.payload.amenities ?? state;
        case "TOGGLE_AMENITY":
            return {
                ...state,
                [action.payload.name]: !state[action.payload.name],
            };
        case "TOGGLE_ALL_AMENITIES":
            return action.payload.amenities ?? state;
        default:
            return state;
    }
};
