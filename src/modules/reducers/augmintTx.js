import store from "../store/index.js";

export const NEW_AUGMINT_TX_MESSAGE = "augmintTx/NEW_MESSAGE";
export const NEW_AUGMINT_TX_TRANSFER = "augmintTx/NEW_TRANSFER";

const initialState = {
    newMessage: null,
    messages: []
};
const nonce = "0x0000000000000000000000000000000000000000000000000000000000000003"; // to be a random hash with proper entrophy

const signDelegatedTransfer = async clientParams => {
    let txHash;
    const web3 = store.getState().web3Connect.web3Instance;

    if (clientParams.narrative === "") {
        // workaround b/c solidity keccak256 results different txHAsh with empty string than web3
        txHash = web3.utils.soliditySha3(
            clientParams.from,
            clientParams.to,
            clientParams.amount,
            clientParams.maxExecutorFee,
            clientParams.nonce || nonce
        );
    } else {
        txHash = web3.utils.soliditySha3(
            clientParams.from,
            clientParams.to,
            clientParams.amount,
            clientParams.narrative,
            clientParams.maxExecutorFee,
            clientParams.nonce || nonce
        );
    }

    const signature = await web3.eth.sign(txHash, clientParams.from);

    return signature;
};

const isValidMessage = msg => true;
const persistMessage = msg => true;

export default (state = initialState, action) => {
    switch (action.type) {
        case NEW_AUGMINT_TX_MESSAGE:
            const newMessage = action.result;
            if (isValidMessage(newMessage)) {
                persistMessage(newMessage);
                console.debug("[augmint tx] listener: ", newMessage);
                state.messages = [newMessage, ...state.messages];
                return {
                    ...state,
                    newMessage
                };
            }
            return state;
        case NEW_AUGMINT_TX_TRANSFER:
            return new Promise(resolve => {
                const { amount, maxExecutorFee, narrative, to } = action.payload;
                const from = store.getState().web3Connect.userAccount;
                const payload = {
                    from,
                    to,
                    amount,
                    maxExecutorFee,
                    narrative
                };
                signDelegatedTransfer(payload).then(signature => {
                    console.debug(payload, signature);
                    resolve({
                        payload,
                        signature
                    });
                });
            });
        default:
            return state;
    }
};

export const transferTokenDelegated = payload => ({
    type: NEW_AUGMINT_TX_TRANSFER,
    payload
});
