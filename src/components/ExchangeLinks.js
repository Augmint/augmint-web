import React from "react";

export function MrCoinBuyLink(props) {
    const { web3Connect, ...other } = props;
    const buyUrlSuffix = `?address=${web3Connect.userAccount}`; // TODO: to be fixed by MrCoin: `&currency=EUR`;

    let mrCoinBuyUrl;
    if (web3Connect.network.id === 1) {
        mrCoinBuyUrl = process.env.REACT_APP_MRCOIN_PRODUCTION_BUY_URL + buyUrlSuffix;
    } else {
        mrCoinBuyUrl = process.env.REACT_APP_MRCOIN_STAGING_BUY_URL + buyUrlSuffix;
    }

    return (
        <a href={mrCoinBuyUrl} target="_blank" {...other}>
            {props.children}
        </a>
    );
}

export function MrCoinSellLink(props) {
    const { web3Connect, ...other } = props;
    const sellUrlSuffix = `?address=${web3Connect.userAccount}&currency=EUR`; // params not working on sell pages but we pass and hope it will :)
    let mrCoinSellUrl;

    if (web3Connect.network.id === 1) {
        mrCoinSellUrl = process.env.REACT_APP_MRCOIN_PRODUCTION_SELL_URL + sellUrlSuffix;
    } else {
        mrCoinSellUrl = process.env.REACT_APP_MRCOIN_STAGING_SELL_URL + sellUrlSuffix;
    }

    return (
        <a href={mrCoinSellUrl} target="_blank" {...other}>
            {props.children}
        </a>
    );
}
