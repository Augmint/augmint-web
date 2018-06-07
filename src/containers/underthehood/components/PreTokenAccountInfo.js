import React from "react";
import store from "modules/store";
import { fetchTransfersForAccount } from "modules/reducers/preToken";
import { Pblock } from "components/PageLayout";
import Button from "components/augmint-ui/button";

export function PreTokenAccountInfo(props) {
    const { isLoading, isLoaded, error, loadError } = props.preTokenData;
    const { balance, userAccount, agreementHash, discount, valuationCap } = props.preTokenData.accountInfo;

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(fetchTransfersForAccount(userAccount));
    };

    return (
        <Pblock header="Pretoken Transfers">
            <p>Account: {userAccount}</p>
            <p>Balance: {balance}</p>
            <p>
                Agreement Hash: <small>{agreementHash}</small>
            </p>
            <p>Discount: {discount * 100} %</p>
            <p>Cap: {valuationCap}</p>

            {isLoading && <p>Loading account info...</p>}
            {!isLoaded && !isLoading && <p>account info not loaded</p>}
            {loadError && <p>Load error: {loadError} </p>}
            {error && <p> error: {error} </p>}
            <Button size="small" type="submit" onClick={handleRefreshClick} disabled={isLoading}>
                Refresh account info
            </Button>
        </Pblock>
    );
}
