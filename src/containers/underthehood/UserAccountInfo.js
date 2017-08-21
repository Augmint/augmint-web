import React from "react";
import store from "modules/store";
import { Panel, ButtonToolbar, Button } from "react-bootstrap";
import { fetchUserBalance } from "modules/reducers/userBalances";

export function UserAccountInfo(props) {
    let { userBalances } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(fetchUserBalance(userBalances.account.address));
    };

    return (
        <Panel header={<h3>User Account</h3>}>
            <p>
                {userBalances.account.address}
            </p>
            <p>
                ETH Balance: {userBalances.account.ethBalance} ETH
            </p>
            <p>
                UCD Balance: {userBalances.account.ucdBalance} UCD
            </p>
            <ButtonToolbar>
                <Button
                    bsSize="small"
                    onClick={handleRefreshClick}
                    disabled={userBalances.isLoading}
                >
                    Refresh balance
                </Button>
            </ButtonToolbar>
        </Panel>
    );
}
