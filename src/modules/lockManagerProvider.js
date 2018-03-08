import store from "modules/store";
import { setupWatch } from "./web3Provider";
import {
    connectLockManager,
    fetchProducts
} from "modules/reducers/lockManager";
// import { fetchLoansForAddress } from "modules/reducers/loans";
// import { refreshAugmintToken } from "modules/reducers/augmintToken";
// import { fetchUserBalance } from "modules/reducers/userBalances";

export default () => {
    const lockManager = store.getState().lockManager;
    const web3Connect = store.getState().web3Connect;

    if (!lockManager.isLoading && !lockManager.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        if (web3Connect.isConnected) {
            console.debug(
                "lockManagerProvider - lockManager not connected or loading and web3 already loaded, dispatching connectLockManager() "
            );
            store.dispatch(connectLockManager());
        }
    }
    return;
};

const onWeb3NetworkChange = (newVal) => {
    if (newVal !== null) {
        console.debug("lockManagerProvider - web3Connect.network changed. Dispatching connectLockManager()");
        store.dispatch(connectLockManager());
        store.dispatch(fetchProducts());
    }
};