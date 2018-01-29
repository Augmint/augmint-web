import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshAugmintToken } from "modules/reducers/augmintToken";

export function AugmintTokenInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshAugmintToken());
    };

    return (
        <Pblock header="AugmintToken contract">
            <p>Total token supply: {contract.info.totalSupply} <nobr>A-EUR</nobr></p>
            <p>ETH Reserve: {contract.info.ethBalance} ETH</p>
            <p><nobr>A-EUR</nobr> Reserve: {contract.info.tokenBalance} <nobr>A-EUR</nobr> </p>
            <ContractBaseInfo contract={contract} refreshCb={handleRefreshClick} />
        </Pblock>
    );
}
