import React from "react";
import ErrorDetails from "components/ErrorDetails";
import stringifier from "stringifier";
import { Button } from "semantic-ui-react";

const stringify = stringifier({ maxDepth: 3, indent: "   " });

export function ContractBaseInfo(props) {
    let {
        isConnected,
        isLoading,
        error,
        contract,
        info,
        connectionError
    } = props.contract;
    return (
        <div>
            <p>
                <small>
                    Contract:<br />
                    {contract == null ? (
                        "No contract"
                    ) : (
                        contract.instance.address
                    )}
                </small>
            </p>
            <p>
                {isConnected ? "connected" : "not connected"} |
                {isLoading ? "Loading..." : "not loading"}
            </p>

            {connectionError ? (
                <ErrorDetails header="Connection error">
                    {connectionError.message}
                </ErrorDetails>
            ) : (
                <p>No connection error</p>
            )}

            {error ? (
                <ErrorDetails header="Tx error">{error.message}</ErrorDetails>
            ) : (
                <p>No tx error</p>
            )}

            <p>Info:</p>
            <pre style={{ fontSize: "0.8em", overflow: "auto" }}>
                {stringify(info)}
            </pre>

            <Button size="small" onClick={props.refreshCb} disabled={isLoading}>
                Refresh contract
            </Button>
        </div>
    );
}
