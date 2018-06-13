import React from "react";
import store from "modules/store";
import { fetchSigners } from "modules/reducers/stabilityBoardProxy";
import { Pblock } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { ArrayDump } from "./ArrayDump";

export function StabilityBoardSignersList(props) {
    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(fetchSigners());
    };

    return (
        <Pblock header="Stability Board Signers">
            {props.signers ? <ArrayDump key="StabilityBoardSignersList" items={props.signers} /> : "No signers loaded"}
            <Button
                size="small"
                type="submit"
                onClick={handleRefreshClick}
                disabled={!props.signers || props.signers.isLoading}
            >
                Refresh signers
            </Button>
        </Pblock>
    );
}
