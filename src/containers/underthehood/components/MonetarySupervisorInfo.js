import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";

export function MonetarySupervisorInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshMonetarySupervisor());
    };

    return (
        <Pblock header="MonetarySupervisor">
            <p>ETH Reserve: {contract.info.reserveEthBalance} ETH</p>
            <p>A-EUR Reserve: {contract.info.reserveTokenBalance} A-EUR </p>
            <ContractBaseInfo contractName="MonetarySupervisor" contract={contract} refreshCb={handleRefreshClick} />
        </Pblock>
    );
}
