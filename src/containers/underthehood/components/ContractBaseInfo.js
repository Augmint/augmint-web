import React from "react";
import { ErrorPanel } from "components/MsgPanels";
import stringifier from "stringifier";
import { Button } from "semantic-ui-react";

const stringify = stringifier({ maxDepth: 3, indent: "   " });

export function ContractBaseInfo(props) {
    let { isConnected, isLoading, error, contract, info, connectionError } = props.contract;
    return (
        <div>
            <p>
                <small>
                    Contract:<br />
                    {contract == null ? "No contract" : contract.instance.address}
                </small>
            </p>
            <p>
                {isConnected ? "connected" : "not connected"} |
                {isLoading ? "Loading..." : "not loading"}
            </p>

            {connectionError ? (
                <ErrorPanel header="Connection error">{connectionError.message}</ErrorPanel>
            ) : (
                <p>No connection error</p>
            )}

            {error ? <ErrorPanel header="Tx error">{error.message}</ErrorPanel> : <p>No tx error</p>}

            <p>Info:</p>
            <pre style={{ fontSize: "0.8em", overflow: "auto" }}>{stringify(info)}</pre>

            <Button size="small" onClick={props.refreshCb} disabled={isLoading}>
                Refresh contract
            </Button>
        </div>
    );
}
