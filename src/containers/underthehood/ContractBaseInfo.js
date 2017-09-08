import React from "react";
import { Button, Table } from "react-bootstrap";
import ErrorDetails from "components/ErrorDetails";
import stringifier from "stringifier";

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
            <Table condensed striped>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <small>
                                Contract:<br />
                                {contract == null ? (
                                    "No contract"
                                ) : (
                                    contract.instance.address
                                )}
                            </small>
                        </td>
                    </tr>
                    <tr>
                        <td>{isConnected ? "connected" : "not connected"}</td>
                        <td>{isLoading ? "Loading..." : "not loading"}</td>
                    </tr>
                </tbody>
            </Table>

            {connectionError ? (
                <p>
                    connectionError: <br />{" "}
                    <ErrorDetails style={{ fontSize: 10 + "px" }}>
                        {connectionError.message}
                    </ErrorDetails>
                </p>
            ) : (
                <p>No connection error</p>
            )}

            {error ? (
                <p>
                    Error: <br />{" "}
                    <ErrorDetails style={{ fontSize: 10 + "px" }}>
                        {error.message}
                    </ErrorDetails>
                </p>
            ) : (
                <p>No tx error</p>
            )}

            <p>Info:</p>
            <pre style={{ fontSize: 10 + "px" }}>{stringify(info)}</pre>

            <Button
                bsSize="small"
                onClick={props.refreshCb}
                disabled={isLoading}
            >
                Refresh contract
            </Button>
        </div>
    );
}
