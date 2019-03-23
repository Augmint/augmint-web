import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshRates } from "modules/reducers/rates";
import { ETHEUR } from "utils/constants";

export function RatesInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshRates());
    };

    return (
        <Pblock header="Rates">
            <p>
                {ETHEUR}: {contractData.info.ethFiatRate}
            </p>

            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
