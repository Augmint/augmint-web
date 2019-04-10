import React from "react";
import { Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";
import { MrCoinBuyLink, MrCoinSellLink } from "components/ExchangeLinks";

export default function FiatExchange(props) {
    return (
        <Pblock header={props.header}>
            <Header as="h4" className={"tertiaryColor"} />
        </Pblock>
    );
}
