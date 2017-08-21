import React from "react";
import store from "modules/store";
import { Panel } from "react-bootstrap";
import { ContractBaseInfo } from "./ContractBaseInfo";
import { refreshLoanManager } from "modules/reducers/loanManager";

export function LoanManagerInfo(props) {
    let { contract } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(refreshLoanManager());
    };

    return (
        <Panel header={<h3>LoanManager contract</h3>}>
            <p>
                LoanCount: {contract.info.loanCount}{" "}
            </p>
            <ContractBaseInfo
                contract={contract}
                refreshCb={handleRefreshClick}
            />
        </Panel>
    );
}
