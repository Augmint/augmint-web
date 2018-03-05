import React from "react";
import { ErrorPanel } from "components/MsgPanels";
import stringifier from "stringifier";
import { Button } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

// used instead of JSON.stringify to display any arbitary JSON in contracts.info (eg. handle circular dependencies )
const stringifyInfo = stringifier({ maxDepth: 3, indent: "   " });

export function ContractBaseInfo(props) {
    const { isConnected, isLoading, error, contract, info, connectionError } = props.contract;

    return (
        <div>
            <p>
                <small>
                    {props.contractName} contract:<br />
                    {contract == null ? "No contract" : contract.address}
                </small>
            </p>
            <p data-testid={`${props.contractName}-connectionStatus`}>
                {isConnected ? "connected" : "not connected"} | {isLoading ? "Loading..." : "not loading"}
            </p>

            {connectionError ? (
                <ErrorPanel header="Connection error">{connectionError.message}</ErrorPanel>
            ) : (
                <p>No connection error</p>
            )}

            {error ? <ErrorPanel header="Tx error">{error.message}</ErrorPanel> : <p>No tx error</p>}

            <CopyToClipboard
                text={contract ? JSON.stringify(contract.abi, null, 2) : ""}
                onCopy={() => alert(`${props.contractName} 's ABI copied to clipboard`)}
            >
                <Button size="small" disabled={isLoading}>
                    Copy contract ABI to clipboard
                </Button>
            </CopyToClipboard>

            <p>Info:</p>
            <pre style={{ fontSize: "0.8em", overflow: "auto" }}>{stringifyInfo(info)}</pre>

            <Button size="small" onClick={props.refreshCb} disabled={isLoading}>
                Refresh contract
            </Button>
        </div>
    );
}
