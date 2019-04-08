import React from "react";
import { Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";
import { MrCoinBuyLink, MrCoinSellLink } from "components/ExchangeLinks";

export default function FiatExchange(props) {
    return (
        <Pblock header={props.header}>
            <Header as="h4" className={"tertiaryColor"}>
                <MrCoinBuyLink web3Connect={props.web3Connect} style={{ fontWeight: "bolder" }}>
                    Buy
                </MrCoinBuyLink>{" "}
                or{" "}
                <MrCoinSellLink web3Connect={props.web3Connect} style={{ fontWeight: "bolder" }}>
                    Sell
                </MrCoinSellLink>{" "}
                A-EUR for Euro on MrCoin.eu
            </Header>
        </Pblock>
    );
}
