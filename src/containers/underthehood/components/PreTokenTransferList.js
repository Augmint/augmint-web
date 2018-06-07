import React from "react";
import store from "modules/store";
import { fetchTransfersForAccount } from "modules/reducers/preToken";
import { Pblock } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { ArrayDump } from "./ArrayDump";

export function PreTokenTransferList(props) {
    const { transfers, userAccount, isLoading, isLoaded, error, loadError } = props.preTokenData;
    console.log(props);

    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(fetchTransfersForAccount(userAccount));
    };

    return (
        <Pblock header="Pretoken Transfers">
            {isLoaded && <ArrayDump key="PreTokenTransferList" items={transfers} />}
            {isLoading && <p>Loading transfers...</p>}
            {!isLoaded && !isLoading && <p>transfers not loaded</p>}
            {loadError && <p>Load error: {loadError} </p>}
            {error && <p> error: {error} </p>}
            <Button size="small" type="submit" onClick={handleRefreshClick} disabled={isLoading}>
                Refresh transfers
            </Button>
        </Pblock>
    );
}
