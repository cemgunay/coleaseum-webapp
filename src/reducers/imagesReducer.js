export const imagesReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            return action.payload.images ?? state;
        case 'ADD_IMAGE':
            return [...state, action.payload];
        case 'REMOVE_IMAGE':
            return state.filter((image, index) => index !== action.payload);
        case 'REORDER_IMAGES':
            return action.payload;
        // ... other image-specific actions
        default:
            return state;
    }
};
