import React from "react";
import { Button, Table } from "react-bootstrap";
import ErrorDetails from "components/ErrorDetails";
import stringifier from "stringifier";

const stringify = stringifier({ maxDepth: 3, indent: "   " });

export function ContractBaseInfo(props) {
    let { isConnected, isLoading, error, contract, info } = props.contract;
    return (
        <div>
            <Table condensed striped>
                <tbody>
                    <tr>
                        <td colSpan="2">
                            <small>
                                Contract:<br />
                                {contract == null
                                    ? "No contract"
                                    : contract.instance.address}
                            </small>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {isConnected ? "connected" : "not connected"}
                        </td>
                        <td>
                            {isLoading ? "Loading..." : "not loading"}
                        </td>
                    </tr>
                </tbody>
            </Table>

            {error
                ? <p>
                      Error: <br />{" "}
                      <ErrorDetails style={{ fontSize: 10 + "px" }}>
                          stringify(error)
                      </ErrorDetails>
                  </p>
                : <p>No error</p>}

            <p>Info:</p>
            <pre style={{ fontSize: 10 + "px" }}>
                {stringify(info)}
            </pre>

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
