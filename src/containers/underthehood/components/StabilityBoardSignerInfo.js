import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshStabilityBoardSigner } from "modules/reducers/stabilityBoardSigner";

export function StabilityBoardSignerInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshStabilityBoardSigner());
    };

    return (
        <Pblock header="Stability Board">
            <p>Active signers: {contractData.info.activeSignersCount}</p>

            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
