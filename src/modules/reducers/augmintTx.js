import store from "modules/store";
import { DECIMALS } from "utils/constants";
import { floatNumberConverter } from "utils/converter";
import { transferTokenDelegatedTx } from "modules/ethereum/transferTransactions";
import TransferProcessor from "../../delegatedTransfer";

export const AUGMINT_TX_NEW_MESSAGE = "augmintTx/NEW_MESSAGE";
export const AUGMINT_TX_TRANSFER_REQUESTED = "augmintTx/TRANSFER_REQUEST";
export const AUGMINT_TX_TRANSFER_SUCCESS = "augmintTx/TRANSFER_SUCCESS";
export const AUGMINT_TX_TRANSFER_ERROR = "augmintTx/TRANSFER_ERROR";
export const AUGMINT_TX_CHANGE_TOPIC = "augmintTx/CHANGE_TOPIC";
export const AUGMINT_TX_NEW_LIST = "augmintTx/NEW_LIST";
export const AUGMINT_TX_NEW_MESSAGE_ERROR = "augmintTx/NEW_MESSAGE_ERROR";

const DEBUG = "[augmint-tx]";

class Message {
    hash = null;
    signature = "";
    payload = null;

    get statusText() {
        return "??";
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

function createDelegator(ipfs) {
    const delegator = new TransferProcessor(ipfs);
    delegator.verify = msg => {
        const state = store.getState();
        const web3 = state.web3Connect.web3Instance;
        const myMessage = new Message(msg);
        return myMessage.verify(web3);
    };
    delegator.on("change", async () => {
        const exportList = await delegator.exportTopic();
        console.debug(exportList);
        /*
        store.dispatch({
            type: AUGMINT_TX_NEW_LIST,
            list: exportList
        });
        */
    });

    window.delegator = delegator;
    return delegator;
}

const initialState = {
    newMessage: null,
    messages: [],
    repeats: [],
    repeating: false,
    currentTopic: "",
    currentTransfer: Promise.resolve(),
    delegator: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case AUGMINT_TX_CHANGE_TOPIC:
            const { newTopic, ipfs } = action.payload;
            let delegator = state.delegator;
            if (!delegator) {
                delegator = createDelegator(ipfs);
            }
            delegator.listen(newTopic);
            delegator.repeat();
            return {
                ...state,
                delegator,
                currentTopic: newTopic
            };
        case AUGMINT_TX_NEW_LIST:
            return {
                ...state,
                messages: action.list
            };
        case AUGMINT_TX_TRANSFER_SUCCESS:
        case AUGMINT_TX_NEW_MESSAGE:
        case AUGMINT_TX_NEW_MESSAGE_ERROR:
        case AUGMINT_TX_TRANSFER_REQUESTED:
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
                payload: tx
            });
            await newMessage.sign(web3);
            await state.augmintTx.delegator.publish(newMessage);
            return dispatch({
                type: AUGMINT_TX_TRANSFER_SUCCESS,
                newMessage
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
