import React from "react";
import { ErrorPanel } from "components/MsgPanels";
import stringifier from "stringifier";
import Button from "../../../components/augmint-ui/button";
import { CopyToClipboard } from "react-copy-to-clipboard";

// used instead of JSON.stringify to display any arbitary JSON in contracts.info (eg. handle circular dependencies )
const stringifyInfo = stringifier({ maxDepth: 3, indent: "   " });

export function ContractBaseInfo(props) {
    const { contractData, contract } = props;
    const contractName = contract && contract.abiFile.contractName;

    let contractConnectionDiv;
    if (contract) {
        const { abi } = contract;
        contractConnectionDiv = (
            <div>
                <p>Contract name: {contractName} </p>
                <p>
                    Address: <small>{contract.address}</small>
                </p>
                <p>
                    Abi version hash: <small>{contract ? contract.abiVersionHash : "?"}</small>
                </p>
                <CopyToClipboard
                    text={abi ? JSON.stringify(abi, null, 2) : "<abi not loaded"}
                    onCopy={() => alert(`${contractName} 's ABI copied to clipboard`)}
                >
                    <Button size="small" disabled={!contract}>
                        Copy contract ABI to clipboard
                    </Button>
                </CopyToClipboard>
            </div>
        );
    }

    let contractDataDiv;
    if (contractData) {
        const { isLoaded, isLoading, error, info, loadError } = contractData;
        contractDataDiv = (
            <div>
                <p data-testid={`${contractName}-dataStatus`}>
                    {isLoaded ? "Loaded" : "Not loaded"} | {isLoading ? "Loading..." : "not loading"} |{" "}
                    {!loadError && "No load error"}
                </p>
                {loadError && <ErrorPanel header="Load error">{loadError.message}</ErrorPanel>}
                {error && <ErrorPanel header="Load error">{error.message}</ErrorPanel>}
                <p>Info:</p>
                <pre style={{ fontSize: "0.8em", overflow: "auto" }}>{stringifyInfo(info)}</pre>
                <Button size="small" onClick={props.refreshCb} disabled={isLoading}>
                    Refresh data
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h3>Connection</h3>
            <p>{!contract && "Not connected"}</p>
            {contractConnectionDiv}

            <h3>Data</h3>
            <p>{!contractData && "Not loaded"}</p>
            {contractDataDiv}
        </div>
    );
}
