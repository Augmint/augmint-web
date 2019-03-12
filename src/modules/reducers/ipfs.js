import IPFS from "ipfs";
import store from "modules/store";

export const IPFS_READY = "ipfs/IPFS_READY";

const initialState = {
    isReady: false,
    node: null
};

const node = new IPFS({
    relay: { enabled: true, hop: { enabled: false, active: false } },
    EXPERIMENTAL: { pubsub: true },
    config: {
        Addresses: {
            Swarm: ["/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"]
        }
    }
});

node.once("ready", () => {
    store.dispatch({
        type: IPFS_READY,
        result: node
    });
});

export default (state = initialState, action) => {
    switch (action.type) {
        case IPFS_READY:
            return {
                ...state,
                isReady: true,
                node: action.result
            };

        default:
            return state;
    }
};
