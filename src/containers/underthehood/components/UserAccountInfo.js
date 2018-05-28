import React from "react";
import store from "modules/store";
import { fetchUserBalance } from "modules/reducers/userBalances";
import Button from "components/augmint-ui/button";
import { Pblock } from "components/PageLayout";

export function UserAccountInfo(props) {
    let { userBalances } = props;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(fetchUserBalance(userBalances.account.address));
    };

    return (
        <Pblock header="User Account">
            <p>{userBalances.account.address}</p>
            <p>ETH Balance: {userBalances.account.ethBalance} ETH</p>
            <p data-testid="userAccountTokenBalance">A-EUR Balance: {userBalances.account.tokenBalance} A-EUR</p>

            <Button size="small" type="submit" onClick={handleRefreshClick} disabled={userBalances.isLoading}>
                Refresh balance
            </Button>
        </Pblock>
    );
}
