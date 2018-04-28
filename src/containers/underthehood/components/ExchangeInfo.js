import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshExchange } from "modules/reducers/exchange";

export function ExchangeInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshExchange());
    };

    return (
        <Pblock header="Exchange">
            <p>
                Order Count: Buy: {contractData.info.buyOrderCount} | Sell: {contractData.info.sellOrderCount}
            </p>
            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
