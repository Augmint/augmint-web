import React from "react";
import store from "modules/store";
import { fetchScripts } from "modules/reducers/stabilityBoardSigner";
import { Pblock } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { ArrayDump } from "./ArrayDump";

export function StabilityBoardScriptsList(props) {
    const handleRefreshClick = e => {
        e.preventDefault();
        store.dispatch(fetchScripts());
    };

    return (
        <Pblock header="Stability Board Scripts">
            {props.scripts ? <ArrayDump key="StabilityBoardScriptslist" items={props.scripts} /> : "No scripts loaded"}
            <Button
                size="small"
                type="submit"
                onClick={handleRefreshClick}
                disabled={!props.scripts || props.scripts.isLoading}
            >
                Refresh scripts
            </Button>
        </Pblock>
    );
}
