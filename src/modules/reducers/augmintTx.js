import store from "../store/index.js";
import { IPFS_READY } from "./ipfs.js";
import { WEB3_SETUP_SUCCESS } from "./web3Connect.js";
import { CONTRACTS_CONNECT_SUCCESS } from "./contracts.js";
import { DECIMALS } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

export const NEW_AUGMINT_TX_MESSAGE = "augmintTx/NEW_MESSAGE";
export const AUGMINT_TX_TRANSFER_REQUESTED = "augmintTx/TRANSFER_REQUEST";
export const AUGMINT_TX_TRANSFER_SIGN = "augmintTx/TRANSFER_SIGN";
export const AUGMINT_TX_TRANSFER_SUCCESS = "augmintTx/TRANSFER_SUCCESS";
export const AUGMINT_TX_TRANSFER_ERROR = "augmintTx/TRANSFER_ERROR";

const initialState = {
    newMessage: null,
    messages: [],
    currentTopic: "",
    currentTransfer: Promise.resolve(),
    ipfs: null,
    networkId: null,
    tokenAddress: null
};

const signDelegatedTransfer = async tx => {
    let transactionHash;
    const web3 = store.getState().web3Connect.web3Instance;
    console.debug(tx);
    if (tx.narrative === "") {
        // workaround b/c solidity keccak256 results different txHAsh with empty string than web3
        transactionHash = web3.utils.soliditySha3(tx.from, tx.to, tx.amount, tx.maxExecutorFee, tx.nonce);
    } else {
        transactionHash = web3.utils.soliditySha3(tx.from, tx.to, tx.amount, tx.narrative, tx.maxExecutorFee, tx.nonce);
    }

    const signature = await web3.eth.sign(transactionHash, tx.from);

    return { signature, transactionHash };
};
const publishMessage = async (payload, signature) => {
    const ipfs = store.getState().ipfs.node;
    const topic = store.getState().augmintTx.currentTopic;

    const msg = { payload, signature };
    const result = await ipfs.pubsub.publish(topic, Buffer.from(JSON.stringify(msg)));
    return result;
};

const isValidMessage = msg => true;
const persistMessage = msg => true;

const changeTopic = (state, action) => {
    const nextState = { ...state };
    let ipfs = state.ipfs;
    let networkId = state.networkId;
    let tokenAddress = state.tokenAddress;
    if (action.type === IPFS_READY) {
        ipfs = action.result;
        nextState.ipfs = ipfs;
    } else if (action.type === WEB3_SETUP_SUCCESS) {
        networkId = action.network.id;
        nextState.networkId = networkId;
    } else if (action.type === CONTRACTS_CONNECT_SUCCESS) {
        tokenAddress = action.contracts.augmintToken.address;
        nextState.tokenAddress = tokenAddress;
    }
    if (ipfs && networkId && tokenAddress) {
        const newTopic = `${tokenAddress}-${networkId}`;
        if (state.currentTopic !== newTopic) {
            nextState.currentTopic = newTopic;
            let unsubscribe = Promise.resolve();
            if (state.currentTopic !== "") {
                unsubscribe = ipfs.pubsub.unsubscribe(state.currentTopic);
            }
            unsubscribe.then(() =>
                ipfs.pubsub.subscribe(
                    newTopic,
                    msg => {
                        store.dispatch({
                            type: NEW_AUGMINT_TX_MESSAGE,
                            result: msg.data.toString()
                        });
                    },
                    err => {
                        if (err) {
                            return console.error(`failed to subscribe to ${newTopic}`, err);
                        }
                        console.debug(`subscribed to ${newTopic}`);
                    }
                )
            );
        }
    }

    return nextState;
};

export default (state = initialState, action) => {
    switch (action.type) {
        case NEW_AUGMINT_TX_MESSAGE:
            try {
                const newMessage = JSON.parse(action.result);
                if (isValidMessage(newMessage)) {
                    persistMessage(newMessage);
                    console.debug("[augmint tx] listener: ", newMessage);
                    return {
                        ...state,
                        messages: [newMessage.payload, ...state.messages]
                    };
                }
                return state;
            } catch {
                return state;
            }
        case IPFS_READY:
        case WEB3_SETUP_SUCCESS:
        case CONTRACTS_CONNECT_SUCCESS:
            return changeTopic(state, action);
        case AUGMINT_TX_TRANSFER_REQUESTED:
        case AUGMINT_TX_TRANSFER_SUCCESS:
        case AUGMINT_TX_TRANSFER_ERROR:
        default:
            return state;
    }
};

export const transferTokenDelegated = payload => {
    const web3 = store.getState().web3Connect.web3Instance;
    const { amount, maxExecutorFee, narrative, to } = payload;
    const from = store.getState().web3Connect.userAccount;
    const nonce = web3.utils.padLeft(web3.utils.randomHex(32), 64);
    const tx = {
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
            const result = await publishMessage(tx, signature);
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
};
