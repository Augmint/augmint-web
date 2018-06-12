import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshPreToken } from "modules/reducers/preToken";

export function PreTokenInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshPreToken());
    };

    return (
        <Pblock header="PreToken">
            <p>Total supply: {contractData.info.totalSupply}</p>
            <p>Agreements: {contractData.info.agreementsCount}</p>
            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
