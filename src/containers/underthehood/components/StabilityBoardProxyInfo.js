import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshStabilityBoardProxy } from "modules/reducers/stabilityBoardProxy";

export function StabilityBoardProxyInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshStabilityBoardProxy());
    };

    return (
        <Pblock header="Stability Board">
            <p>Active signers: {contractData.info.activeSignersCount}</p>

            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
