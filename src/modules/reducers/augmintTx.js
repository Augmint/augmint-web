import store from "modules/store";
import { DECIMALS } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

export const AUGMINT_TX_NEW_MESSAGE = "augmintTx/NEW_MESSAGE";
export const AUGMINT_TX_TRANSFER_REQUESTED = "augmintTx/TRANSFER_REQUEST";
export const AUGMINT_TX_TRANSFER_SIGN = "augmintTx/TRANSFER_SIGN";
export const AUGMINT_TX_TRANSFER_SUCCESS = "augmintTx/TRANSFER_SUCCESS";
export const AUGMINT_TX_TRANSFER_ERROR = "augmintTx/TRANSFER_ERROR";
export const AUGMINT_TX_CHANGE_TOPIC = "augmintTx/CHANGE_TOPIC";
export const AUGMINT_TX_REPEAT = "augmintTx/REPEAT";
export const AUGMINT_TX_REPEAT_END = "augmintTx/REPEAT_END";
export const AUGMINT_TX_NEW_LIST = "augmintTx/NEW_LIST";
export const AUGMINT_TX_NEW_MESSAGE_ERROR = "augmintTx/NEW_MESSAGE_ERROR";

const REPEAT_SLICE = 1000;
const REPEAT_TIMEOUT = 5 * 1000;

const initialState = {
    newMessage: null,
    messages: [],
    repeats: [],
    repeating: false,
    currentTopic: "",
    currentTransfer: Promise.resolve()
};

function hashMessage(tx) {
    let transactionHash;
    const web3 = store.getState().web3Connect.web3Instance;
    if (tx.narrative === "") {
        // workaround b/c solidity keccak256 results different txHAsh with empty string than web3
        transactionHash = web3.utils.soliditySha3(
            tx.tokenAddress,
            tx.from,
            tx.to,
            tx.amount,
            tx.maxExecutorFee,
            tx.nonce
        );
    } else {
        transactionHash = web3.utils.soliditySha3(
            tx.tokenAddress,
            tx.from,
            tx.to,
            tx.amount,
            tx.narrative,
            tx.maxExecutorFee,
            tx.nonce
        );
    }

    return transactionHash;
}

async function signDelegatedTransfer(tx) {
    const web3 = store.getState().web3Connect.web3Instance;
    const transactionHash = hashMessage(tx);
    const signature = await web3.eth.personal.sign(transactionHash, tx.from);
    return { signature, transactionHash };
}

async function recoverFrom(tx, signature) {
    const web3 = store.getState().web3Connect.web3Instance;
    const transactionHash = hashMessage(tx);
    const from = await web3.eth.personal.ecRecover(transactionHash, signature);
    return { from, transactionHash };
}

async function publishMessage(payload, signature, hash) {
    const ipfs = store.getState().ipfs.node;
    const topic = store.getState().augmintTx.currentTopic;

    const msg = { payload, signature, hash };
    const result = await ipfs.pubsub.publish(topic, Buffer.from(JSON.stringify(msg)));
    return result;
}

function repeatMessage(msg) {
    setTimeout(async () => {
        if (msg) {
            console.debug("[augmint tx] repeat", msg.hash);
            await publishMessage(msg.payload, msg.signature, msg.hash);
        }
        store.dispatch({ type: AUGMINT_TX_REPEAT_END });
        store.dispatch({ type: AUGMINT_TX_REPEAT });
    }, REPEAT_TIMEOUT);
}

function transformMessage(rawMessage) {
    const newMessage = JSON.parse(rawMessage.data.toString());
    newMessage.lastSeen = {
        id: rawMessage.from,
        date: Date.now()
    };
    return newMessage;
}

function addMessage(newMessage, messages) {
    return async function(dispatch) {
        dispatch({ type: AUGMINT_TX_NEW_MESSAGE });
        try {
            const msg = transformMessage(newMessage);
            const { from, transactionHash } = await recoverFrom(msg.payload, msg.signature);

            if (
                msg.payload.from.toLowerCase() === from.toLowerCase() &&
                msg.hash.toLowerCase() === transactionHash.toLowerCase()
            ) {
                let updated = false;
                const newMessageList = messages.map(item => {
                    if (item.hash === msg.hash) {
                        updated = true;
                        return msg;
                    }
                    return item;
                });

                dispatch({
                    type: AUGMINT_TX_NEW_LIST,
                    list: updated ? newMessageList : [msg, ...newMessageList]
                });
            } else {
                console.error("Message Error: ", msg, from, transactionHash);
                dispatch({
                    type: AUGMINT_TX_NEW_MESSAGE_ERROR,
                    error: { msg, from, transactionHash }
                });
            }
        } catch (e) {
            dispatch({
                type: AUGMINT_TX_NEW_MESSAGE_ERROR,
                error: { newMessage, e }
            });
        }
    };
}

export default (state = initialState, action) => {
    switch (action.type) {
        case AUGMINT_TX_REPEAT:
            if (!state.repeating) {
                const msg = state.repeats.pop();
                repeatMessage(msg, state.repeating);
                return {
                    ...state,
                    repeating: msg,
                    repeats: [msg, ...state.repeats]
                };
            }
            return state;
        case AUGMINT_TX_REPEAT_END:
            return {
                ...state,
                repeating: false
            };
        case AUGMINT_TX_CHANGE_TOPIC:
            const { newTopic, ipfs } = action.payload;
            let unsubscribe = Promise.resolve();
            if (state.currentTopic !== "") {
                unsubscribe = ipfs.pubsub.unsubscribe(state.currentTopic);
            }
            unsubscribe.then(() =>
                ipfs.pubsub.subscribe(
                    newTopic,
                    msg => {
                        store.dispatch(addMessage(msg, state.messages));
                    },
                    err => {
                        if (err) {
                            return console.error(`failed to subscribe to ${newTopic}`, err);
                        }
                        console.debug(`subscribed to ${newTopic}`);
                    }
                )
            );
            return {
                ...state,
                currentTopic: newTopic
            };
        case AUGMINT_TX_NEW_LIST:
            return {
                ...state,
                repeats: action.list.slice(0, REPEAT_SLICE),
                messages: action.list
            };

        case AUGMINT_TX_NEW_MESSAGE:
        case AUGMINT_TX_NEW_MESSAGE_ERROR:
        case AUGMINT_TX_TRANSFER_REQUESTED:
        case AUGMINT_TX_TRANSFER_SUCCESS:
        case AUGMINT_TX_TRANSFER_ERROR:
        default:
            return state;
    }
};

export function transferTokenDelegated(payload) {
    const state = store.getState();
    const web3 = state.web3Connect.web3Instance;
    const { amount, maxExecutorFee, narrative, to } = payload;
    const from = state.web3Connect.userAccount;
    const nonce = web3.utils.padLeft(web3.utils.randomHex(32), 64);
    const tokenAddress = state.contracts.latest.augmintToken.address;
    const tx = {
        tokenAddress,
        from,
        to,
        amount: floatNumberConverter(amount, DECIMALS).toFixed(),
        maxExecutorFee: floatNumberConverter(maxExecutorFee, DECIMALS).toFixed(),
        narrative,
        nonce
    };

    return async dispatch => {
        dispatch({
            type: AUGMINT_TX_TRANSFER_REQUESTED,
            payload
        });

        try {
            const { signature, transactionHash } = await signDelegatedTransfer(tx);
            const result = await publishMessage(tx, signature, transactionHash);
            console.debug(tx, signature, transactionHash, result);
            return dispatch({
                type: AUGMINT_TX_TRANSFER_SUCCESS,
                result: {
                    txName: "A-EUR transfer with delegate",
                    payload,
                    signature,
                    transactionHash
                }
            });
        } catch (error) {
            console.error(error);
            return dispatch({
                type: AUGMINT_TX_TRANSFER_ERROR,
                error
            });
        }
    };
}
