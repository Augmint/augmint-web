import React from "react";
import store from "modules/store";
import { Panel } from "react-bootstrap";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";

export function TokenUcdInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshTokenUcd());
    };

    return (
        <Panel header={<h3>TokenUcd contract</h3>}>
            <p>
                Total token supply: {contract.info.totalSupply} UCD
            </p>
            <p>
                ETH Reserve: {contract.info.ethBalance} ETH
            </p>
            <p>
                UCD Reserve: {contract.info.ucdBalance} UCD{" "}
            </p>
            <ContractBaseInfo
                contract={contract}
                refreshCb={handleRefreshClick}
            />
        </Panel>
    );
}
