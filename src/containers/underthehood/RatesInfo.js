import React from "react";
import store from "modules/store";
import { Panel } from "react-bootstrap";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshRates } from "modules/reducers/rates";

export function RatesInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshRates());
    };

    return (
        <Panel header={<h3>Rates contract</h3>}>
            <p>
                ETH/USD: {contract.info.ethUsdRate}
            </p>

            <ContractBaseInfo
                contract={contract}
                refreshCb={handleRefreshClick}
            />
        </Panel>
    );
}
