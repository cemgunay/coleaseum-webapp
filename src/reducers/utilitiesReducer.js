export const utilitiesReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            return action.payload.utilities ?? state;
        case "TOGGLE_UTILITY":
            return {
                ...state,
                [action.payload.name]: !state[action.payload.name],
            };
            case "TOGGLE_ALL_UTILITIES":
                return action.payload.utilities ?? state;
        default:
            return state;
    }
};
