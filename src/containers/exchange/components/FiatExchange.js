import React from "react";
import { Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";
import { FeatureContext } from "modules/services/featureService";
import { MrCoinBuyLink, MrCoinSellLink } from "components/ExchangeLinks";

export default function FiatExchange(props) {
    return (
        <Pblock header={props.header}>
            <FeatureContext>
                {features => {
                    const dashboard = features.dashboard;

                    return (
                        <Header as="h4" className={dashboard ? "tertiaryColor" : ""}>
                            <MrCoinBuyLink web3Connect={props.web3Connect}>Buy</MrCoinBuyLink> or{" "}
                            <MrCoinSellLink web3Connect={props.web3Connect}>Sell</MrCoinSellLink> A-EUR for Euro on
                            MrCoin.eu
                        </Header>
                    );
                }}
            </FeatureContext>
        </Pblock>
    );
}
