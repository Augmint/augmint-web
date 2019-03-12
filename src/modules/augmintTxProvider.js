import store from "modules/store";
import { NEW_AUGMINT_TX_MESSAGE } from "./reducers/augmintTx.js";

import { setupWatch } from "./web3Provider";

let isWatchSetup = false;
let subscribed = false;

const TOPIC = "AUGMINT_TX";

export default () => {
    if (!subscribed) {
        const ipfs = store.getState().ipfs.node;
        if (ipfs) {
            onReady();
        } else {
            if (!isWatchSetup) {
                isWatchSetup = true;
                setupWatch("ipfs.node", onReady);
            }
        }
    }
};

const onReady = () => {
    subscribed = true;
    const ipfs = store.getState().ipfs.node;
    console.debug("ipfs ready!");
    ipfs.pubsub.subscribe(
        TOPIC,
        msg => {
            store.dispatch({
                type: NEW_AUGMINT_TX_MESSAGE,
                result: msg.data.toString()
            });
        },
        err => {
            if (err) {
                subscribed = false;
                return console.error(`failed to subscribe to ${TOPIC}`, err);
            }
            console.debug(`subscribed to ${TOPIC}`);
        }
    );
};
