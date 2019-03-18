import store from "./store/index.js";
import { AUGMINT_TX_CHANGE_TOPIC } from "./reducers/augmintTx.js";

let watching = false;

const changeTopic = () => {
    const state = store.getState();
    const currentTopic = state.augmintTx.currentTopic;
    let ipfs = state.ipfs.node;
    let networkId = state.web3Connect.network && state.web3Connect.network.id;
    let tokenAddress = state.contracts.latest.augmintToken && state.contracts.latest.augmintToken.address;
    if (ipfs && networkId && tokenAddress) {
        const newTopic = `${tokenAddress}-${networkId}`;
        if (currentTopic !== newTopic) {
            store.dispatch({
                type: AUGMINT_TX_CHANGE_TOPIC,
                payload: {
                    newTopic,
                    ipfs
                }
            });
        }
    }
};

export function setupTopicWatch() {
    if (!watching) {
        watching = true;
        store.subscribe(changeTopic);
    }
}
