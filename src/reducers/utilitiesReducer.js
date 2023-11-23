export const utilitiesReducer = (state, action) => {
    switch (action.type) {
        case "LOAD_STATE":
            return action.payload.utilities ?? state;
        case 'TOGGLE_UTILITY':
            return {
                ...state,
                [action.payload]: !state[action.payload],
            };
        // ... other utility-specific actions
        default:
            return state;
    }
};
