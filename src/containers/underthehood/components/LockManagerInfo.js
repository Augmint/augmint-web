import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshLockManager } from "modules/reducers/lockManager";

export function LockManagerInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshLockManager());
    };

    return (
        <Pblock header="LockerInfo">
            <p>LockCount: {contract.info.lockCount} </p>
            <ContractBaseInfo contractName="Locker" contract={contract} refreshCb={handleRefreshClick} />
        </Pblock>
    );
}
