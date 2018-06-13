import React from "react";
import { Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";
import { FeatureContext } from "modules/services/featureService";

export default function FiatExchange(props) {
    const urlSuffix = `?address=${props.userAccountAddress}&currency=EUR`;
    let mrCoinUrl =
        props.network.id === 1 ? process.env.REACT_APP_MRCOIN_PRODUCTION_URL : process.env.REACT_APP_MRCOIN_STAGING_URL;
    mrCoinUrl += urlSuffix;

    return (
        <Pblock header={props.header}>
            <FeatureContext>
                {
                    features => { 
                        const dashboard = features.dashboard;

                        return (
                            <Header as="h4" className={ dashboard ? "tertiaryColor" : "" }>
                                Buy or Sell A-EUR for Euro on{" "}
                                <a href={mrCoinUrl} target="_blank">
                                    MrCoin.eu
                                </a>
                            </Header>
                        );
                    }
                }
            </FeatureContext>
        </Pblock>
    );
}
