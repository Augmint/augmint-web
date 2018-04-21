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
        <Pblock header="AugmintToken">
            <p>Total token supply: {contract.info.totalSupply} A-EUR</p>
            <p>
                Fee account: <small>{contract.info.feeAccountAddress}</small>
            </p>
            <p>
                Fee account balance: {contract.info.feeAccountTokenBalance} A-EUR | {contract.info.feeAccountEthBalance}{" "}
                ETH
            </p>
            <ContractBaseInfo contractName="AugmintToken" contract={contract} refreshCb={handleRefreshClick} />
        </Pblock>
    );
}
