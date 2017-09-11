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
            <p>OrderCount: {contract.info.orderCount}</p>
            <p>
                To sell: {contract.info.totalEthSellOrders} ETH |{" "}
                {contract.info.totalUcdSellOrders} UCD
            </p>
            <ContractBaseInfo
                contract={contract}
                refreshCb={handleRefreshClick}
            />
        </Pblock>
    );
}
