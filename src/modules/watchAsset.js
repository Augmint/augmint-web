export const watchAsset = (address, augmint, provider, cookie) => {
    const tokenType = "ERC20";
    const image = "https://www.augmint.org/augmint-token-image.png"; // only works after deploy
    const id = Math.round(Math.random() * 100000); // TODO

    const method = "wallet_watchAsset";
    const options = {
        address: address,
        symbol: augmint.info.symbol,
        decimals: augmint.info.decimals,
        image: image
    };

    let promise = new Promise((resolve, reject) => {
        provider.sendAsync(
            {
                method: method,
                params: {
                    type: tokenType,
                    options: options
                },
                id: id
            },
            (err, added) => {
                if (added.result) {
                    resolve(added.result);
                } else if (err || added.error) {
                    resolve(false);
                }
            }
        );
    });

    return promise;
};
