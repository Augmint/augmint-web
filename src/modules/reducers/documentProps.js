export const DOCUMENT_LOADED = "documentProps/DOCUMENT_LOADED";

const initialState = {
    documentLoaded: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case DOCUMENT_LOADED:
            return {
                ...state,
                documentLoaded: true
            };

        default:
            return state;
    }
};

export const documentLoaded = () => {
    return {
        type: DOCUMENT_LOADED
    };
};
