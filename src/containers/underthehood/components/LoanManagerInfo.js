import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshLoanManager } from "modules/reducers/loanManager";

export function LoanManagerInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshLoanManager());
    };

    return (
        <Pblock header="LoanManager contract">
            <p>LoanCount: {contract.info.loanCount} </p>
            <ContractBaseInfo
                contract={contract}
                refreshCb={handleRefreshClick}
            />
        </Pblock>
    );
}
