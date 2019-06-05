import store from "modules/store";
import { setupWeb3, accountChange } from "modules/reducers/web3Connect";
import { connectContracts } from "modules/reducers/contracts";

/*
    TODO: make it to a HOC
*/
let intervalId;

export const connectWeb3 = () => {
    const web3Connect = store.getState().web3Connect;
    const disclaimerAccepted = web3Connect.disclaimerAccepted;
    const documentProps = store.getState().documentProps;
    const documentLoaded = documentProps.documentLoaded;

    const mainPath = window.location.pathname.split("/").length > 0 ? "/" + window.location.pathname.split("/")[1] : "";
    const shouldConnect = ["/", "/concept", "/manifesto", "/disclaimer", "/roadmap", "/team"].indexOf(mainPath) < 0;

    if (shouldConnect && disclaimerAccepted && documentLoaded) {
        if (!web3Connect.isConnected && !web3Connect.isLoading) {
            // if web3 is not connected
            onLoad();
        } else if (web3Connect.isConnected && !web3Connect.isLoading && !web3Connect.userConnected) {
            // if web3 is connected, but user rejected to connect address to augmint
            onLoad();
        }
    }
};

const onLoad = () => {
    store.dispatch(setupWeb3());
    if (!intervalId) {
        intervalId = setInterval(async function() {
            const web3 = store.getState().web3Connect;
            if (web3 && web3.isConnected && !web3.isLoading) {
                const currentAccounts = await web3.web3Instance.eth.getAccounts();
                const userAccount = store.getState().web3Connect.userAccount;
                if (currentAccounts[0] !== userAccount) {
                    console.debug(
                        "App.setInterval - web3.eth.accounts[0] change detected. dispatching accountChange()"
                    );
                    store.dispatch(accountChange(currentAccounts));
                }
            }
        }, 1000);
    }
};

export const onWeb3NetworkChange = newVal => {
    // TODO: make filters + subscriptions generic, e.g use an array
    if (newVal) {
        store.dispatch(connectContracts());
    }
};
