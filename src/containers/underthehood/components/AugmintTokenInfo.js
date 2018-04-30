import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshAugmintToken } from "modules/reducers/augmintToken";

export function AugmintTokenInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshAugmintToken());
    };

    return (
        <Pblock header="AugmintToken">
            <p>Total token supply: {contractData.info.totalSupply} A-EUR</p>
            <p>
                Fee account: <small>{contractData.info.feeAccountAddress}</small>
            </p>
            <p>
                Fee account balance: {contractData.info.feeAccountTokenBalance} A-EUR |{" "}
                {contractData.info.feeAccountEthBalance} ETH
            </p>
            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
