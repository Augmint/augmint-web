import { setCookie } from "utils/cookie.js";

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
            if (added) {
                setCookie("watchAsset", cookie);
            } else {
                console.error(err);
            }
        }
    );
};
