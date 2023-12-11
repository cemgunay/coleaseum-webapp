export const listingDetailsReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            const { moveInDate, moveOutDate, ...otherDetails } =
                action.payload.listingDetails;
            return {
                ...state,
                moveInDate: moveInDate || state.moveInDate,
                moveOutDate: moveOutDate || state.moveOutDate,
                ...otherDetails,
            };
        case "UPDATE_USER_ID":
            return { ...state, userId: action.payload };
        case "UPDATE_ID":
            return { ...state, _id: action.payload };
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
                basics: { ...state.basics, ...action.payload },
            };
        case "UPDATE_TITLE":
            return { ...state, title: action.payload };
        case "UPDATE_DESCRIPTION":
            return { ...state, description: action.payload };
        case "UPDATE_PUBLISHED":
            return { ...state, published: action.payload };
        case "UPDATE_PRICE":
            return { ...state, price: action.payload };
        case "UPDATE_MOVE_IN_DATE":
            return { ...state, moveInDate: action.payload };
        case "UPDATE_MOVE_OUT_DATE":
            return { ...state, moveOutDate: action.payload };
        case "UPDATE_VIEWING_DATES":
            return { ...state, viewingDates: action.payload };
        case "ADD_VIEWING_DATE":
            return {
                ...state,
                viewingDates: [...state.viewingDates, null],
            };
        case "REMOVE_VIEWING_DATE":
            return {
                ...state,
                viewingDates: state.viewingDates.filter(
                    (_, index) => index !== action.payload.index
                ),
            };
        // ... other cases for different form sections
        default:
            return state;
    }
};
