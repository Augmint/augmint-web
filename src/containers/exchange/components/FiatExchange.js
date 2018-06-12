import React from "react";
import { Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";

export default function FiatExchange(props) {
    const sellUrlSuffix = `?address=${props.userAccountAddress}&currency=EUR`; // params not working on sell pages but we pass and hope it will :)
    const buyUrlSuffix = `?address=${props.userAccountAddress}&currency=EUR`;
    let mrCoinSellUrl;
    let mrCoinBuyUrl;
    if (props.network.id === 1) {
        mrCoinSellUrl = process.env.REACT_APP_MRCOIN_PRODUCTION_SELL_URL + sellUrlSuffix;
        mrCoinBuyUrl = process.env.REACT_APP_MRCOIN_PRODUCTION_BUY_URL + buyUrlSuffix;
    } else {
        mrCoinSellUrl = process.env.REACT_APP_MRCOIN_STAGING_SELL_URL + sellUrlSuffix;
        mrCoinBuyUrl = process.env.REACT_APP_MRCOIN_STAGING_BUY_URL + buyUrlSuffix;
    }

    return (
        <Pblock header={props.header}>
            <Header as="h4">
                <a href={mrCoinBuyUrl} target="_blank">
                    Buy
                </a>{" "}
                or{" "}
                <a href={mrCoinSellUrl} target="_blank">
                    Sell
                </a>{" "}
                A-EUR for Euro on MrCoin.eu
            </Header>
        </Pblock>
    );
}
