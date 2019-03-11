// WIP
import store from "modules/store";

export const watchAsset = () => {
    const augmint = store.getState().augmintToken.info;
    const etherProvider = store.getState().web3Connect.ethers.provider;
    // const user = store.getState().userBalances
    const contracts = store.getState().contracts;

    const tokenType = "ERC20";
    const image = "http://placekitten.com/200/300";
    const id = Math.round(Math.random() * 100000); // TODO

    if (augmint.symbol && augmint.decimals && contracts) {
        const options = {
            address: contracts.latest.augmintToken.address,
            symbol: augmint.symbol,
            decimals: augmint.decimals,
            image: image
        };

        etherProvider._sendAsync(
            {
                method: "wallet_watchAsset",
                params: {
                    type: tokenType,
                    options: options
                },
                id: id
            },
            (err, added) => {
                if (added) {
                    console.log("ADDED", added);
                } else {
                    console.log("ERR NOT ADDED");
                }
            }
        );
    }
};
