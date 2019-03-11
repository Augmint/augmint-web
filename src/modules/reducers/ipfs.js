import IPFS from "ipfs";
import store from "modules/store";

export const IPFS_READY = "ipfs/IPFS_READY";

const node = new IPFS();
const initialState = {
    isReady: false,
    ipfs: null
};

node.once("ready", () => {
    store.dispatch({
        type: IPFS_READY,
        result: node
    });
    node.stop(() => {});
});

export default (state = initialState, action) => {
    switch (action.type) {
        case IPFS_READY:
            return {
                ...state,
                isReady: true,
                ipfs: action.result
            };

        default:
            return state;
    }
};
