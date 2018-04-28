import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshLockManager } from "modules/reducers/lockManager";

export function LockManagerInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshLockManager());
    };

    return (
        <Pblock header="LockerInfo">
            <p>LockCount: {contractData.info.lockCount} </p>
            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
