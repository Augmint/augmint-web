import store from "modules/store";
import { DECIMALS, DELEGATED_TRANSPORT_REPEAT_SLICE, DELEGATED_TRANSPORT_REPEAT_TIMEOUT } from "utils/constants";
import { floatNumberConverter } from "utils/converter";
import { transferTokenDelegatedTx } from "modules/ethereum/transferTransactions";

export const AUGMINT_TX_NEW_MESSAGE = "augmintTx/NEW_MESSAGE";
export const AUGMINT_TX_TRANSFER_REQUESTED = "augmintTx/TRANSFER_REQUEST";
export const AUGMINT_TX_TRANSFER_SUCCESS = "augmintTx/TRANSFER_SUCCESS";
export const AUGMINT_TX_TRANSFER_ERROR = "augmintTx/TRANSFER_ERROR";
export const AUGMINT_TX_CHANGE_TOPIC = "augmintTx/CHANGE_TOPIC";
export const AUGMINT_TX_REPEAT = "augmintTx/REPEAT";
export const AUGMINT_TX_REPEAT_END = "augmintTx/REPEAT_END";
export const AUGMINT_TX_NEW_LIST = "augmintTx/NEW_LIST";
export const AUGMINT_TX_NEW_MESSAGE_ERROR = "augmintTx/NEW_MESSAGE_ERROR";

const DEBUG = "[augmint-tx]";

const MESSAGE_STATUS = {
    WAITING: 1,
    IN_PROGRESS: 2,
    COMPLETED: 3
};

const MESSAGE_STATUS_TEXT = [undefined, "waiting for transfer", "in progress", "completed"];

class Message {
    hash = null;
    signature = "";
    payload = null;
    status = MESSAGE_STATUS.WAITING;
    lastSeen = null;

    get statusText() {
        return MESSAGE_STATUS_TEXT[this.status];
    }

    transfer = async () => {
        const tx = await transferTokenDelegatedTx(this.payload, this.signature);
        console.debug(DEBUG, "delegated", tx);
    };

    constructor(o) {
        Object.assign(this, o);
    }

    makeHash(web3) {
        const tx = this.payload;
        let hash = "";
        if (tx.narrative === "") {
            // workaround b/c solidity keccak256 results different txHAsh with empty string than web3
            hash = web3.utils.soliditySha3(tx.tokenAddress, tx.from, tx.to, tx.amount, tx.maxExecutorFee, tx.nonce);
        } else {
            hash = web3.utils.soliditySha3(
                tx.tokenAddress,
                tx.from,
                tx.to,
                tx.amount,
                tx.narrative,
                tx.maxExecutorFee,
                tx.nonce
            );
        }

        this.hash = hash.toLowerCase();
        console.debug(DEBUG, "hash", this);
    }

    async sign(web3) {
        this.makeHash(web3);
        const signature = await web3.eth.personal.sign(this.hash, this.payload.from);
        this.signature = signature.toLowerCase();
        console.debug(DEBUG, "sign", this);
    }

    async verify(web3) {
        this.makeHash(web3);
        const from = await web3.eth.personal.ecRecover(this.hash, this.signature);
        console.debug(DEBUG, "verify", this.hash, this.payload.from.toLowerCase(), from.toLowerCase());
        return this.payload.from.toLowerCase() === from.toLowerCase();
    }
}

const initialState = {
    newMessage: null,
    messages: [],
    repeats: [],
    repeating: false,
    currentTopic: "",
    currentTransfer: Promise.resolve()
};

async function publishMessage(msg) {
    const ipfs = store.getState().ipfs.node;
    const topic = store.getState().augmintTx.currentTopic;
    console.debug(DEBUG, "published:", msg);
    const result = await ipfs.pubsub.publish(topic, Buffer.from(JSON.stringify(msg)));
    return result;
}

function repeatMessage(msg) {
    setTimeout(async () => {
        if (msg) {
            console.debug(DEBUG, "repeat", msg.hash);
            await publishMessage(msg);
        }
        store.dispatch({ type: AUGMINT_TX_REPEAT_END });
        store.dispatch({ type: AUGMINT_TX_REPEAT });
    }, DELEGATED_TRANSPORT_REPEAT_TIMEOUT);
}

function transformMessage(rawMessage) {
    const newMessage = new Message(JSON.parse(rawMessage.data.toString()));
    newMessage.lastSeen = {
        id: rawMessage.from,
        date: Date.now()
    };
    return newMessage;
}

function addMessage(newMessage) {
    const state = store.getState();
    const web3 = state.web3Connect.web3Instance;
    return async function(dispatch) {
        const messages = store.getState().augmintTx.messages;
        dispatch({ type: AUGMINT_TX_NEW_MESSAGE });
        try {
            const msg = transformMessage(newMessage);
            console.debug(DEBUG, "received:", msg);

            if (msg.verify(web3)) {
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
                dispatch({
                    type: AUGMINT_TX_NEW_MESSAGE_ERROR,
                    error: { msg }
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
                        console.debug(DEBUG, `subscribed to ${newTopic}`);
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
                repeats: action.list.slice(0, DELEGATED_TRANSPORT_REPEAT_SLICE),
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
            const newMessage = new Message({
                payload: tx,
                status: MESSAGE_STATUS.WAITING
            });
            await newMessage.sign(web3);
            await publishMessage(newMessage);
            return dispatch({
                type: AUGMINT_TX_TRANSFER_SUCCESS,
                result: newMessage
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
