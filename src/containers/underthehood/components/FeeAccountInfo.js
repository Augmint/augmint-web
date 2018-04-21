import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshAugmintToken } from "modules/reducers/augmintToken";

export function FeeAccountInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshAugmintToken());
    };

    return (
        <Pblock header="FeeAccount">
            <ContractBaseInfo contractName="FeeAccount" contract={contract} refreshCb={handleRefreshClick} />
        </Pblock>
    );
}
