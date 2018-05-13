import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshLoanManager } from "modules/reducers/loanManager";

export function LoanManagerInfo(props) {
    const { contractData } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshLoanManager());
    };

    return (
        <Pblock header="LoanManager">
            <p>LoanCount: {contractData.info.loanCount} </p>
            <ContractBaseInfo refreshCb={handleRefreshClick} {...props} />
        </Pblock>
    );
}
