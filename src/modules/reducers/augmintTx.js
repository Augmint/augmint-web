export const NEW_AUGMINT_TX_MESSAGE = "augmintTx/NEW_MESSAGE";

const initialState = {
    newMessage: null,
    messages: []
};

const isValidMessage = msg => true;
const persistMessage = msg => true;

export default (state = initialState, action) => {
    switch (action.type) {
        case NEW_AUGMINT_TX_MESSAGE:
            const newMessage = action.result;
            if (isValidMessage(newMessage)) {
                persistMessage(newMessage);
                state.messages = [newMessage, ...state.messages];
                return {
                    ...state,
                    newMessage
                };
            }
            return state;
        default:
            return state;
    }
};
