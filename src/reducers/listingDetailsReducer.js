export const listingDetailsReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            return action.payload.listingDetails ?? state;
        case "UPDATE_USER_ID":
            return { ...state, userId: action.payload };
        case "UPDATE_ID":
            return {...state, _id: action.payload};
        case "UPDATE_ABOUT_YOUR_PLACE":
            return {
                ...state,
                aboutYourPlace: { ...state.aboutYourPlace, ...action.payload },
            };
        case "UPDATE_LOCATION":
            return {
                ...state,
                location: { ...state.location, ...action.payload },
            };
        case "UPDATE_BASICS":
            return {
                ...state,
                location: { ...state.location, ...action.payload },
            };
        case "UPDATE_TITLE":
            return { ...state, title: action.payload };
        case "UPDATE_DESCRIPTION":
            return { ...state, description: action.payload };
        case "UPDATE_PUBLISHED":
            return { ...state, published: action.payload };
        case "UPDATE_PRICE":
            return { ...state, price: action.payload };
        case "UPDATE_DATES":
            return {
                ...state,
                moveInDate: action.payload.moveInDate,
                moveOutDate: action.payload.moveOutDate,
                expiryDate: action.payload.expiryDate,
            };
        // ... other cases for different form sections
        default:
            return state;
    }
};
