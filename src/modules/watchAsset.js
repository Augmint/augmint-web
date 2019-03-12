import store from "modules/store";

export const watchAsset = () => {
    const augmint = store.getState().augmintToken.info;
    const currentProvider = store.getState().web3Connect.web3Instance.currentProvider;
    const contracts = store.getState().contracts;

    const tokenType = "ERC20";
    const image = "https://www.augmint.org/apple-touch-icon.png"; // TODO
    const id = Math.round(Math.random() * 100000); // TODO

    const method = "wallet_watchAsset";
    const options = {
        address: contracts.latest.augmintToken.address,
        symbol: augmint.symbol,
        decimals: augmint.decimals,
        image: image
    };

    currentProvider.sendAsync(
        {
            method: method,
            params: {
                type: tokenType,
                options: options
            },
            id: id
        },
        (err, added) => {
            if (added) {
                console.log("TOKEN ADDED");
            } else {
                console.error(err);
            }
        }
    );
};
