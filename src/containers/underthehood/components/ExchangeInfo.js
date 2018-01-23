import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshExchange } from "modules/reducers/exchange";

export function ExchangeInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshExchange());
    };

    return (
        <Pblock header="Exchange contract">
            <p>
                Order Count: Buy: {contract.info.buyOrderCount} | Sell: {contract.info.sellOrderCount}
            </p>
            <ContractBaseInfo contract={contract} refreshCb={handleRefreshClick} />
        </Pblock>
    );
}
