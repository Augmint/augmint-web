import React from "react";
import { ErrorPanel } from "components/MsgPanels";
//import stringifier from "stringifier";
import { Pblock } from "components/PageLayout";

//const stringifyInfo = stringifier({ maxDepth: 3, indent: "   " });

export default class ContractConnectionsInfo extends React.Component {
    render() {
        const { contracts } = this.props;
        const { isConnected, isLoading, error } = contracts;
        return (
            <Pblock header="Contract connections">
                <p data-testid="contractConnectionsInfo">
                    {isConnected ? "connected" : "not connected"} | {isLoading ? "Loading..." : "not loading"}
                </p>
                {error && <ErrorPanel header="Connection error">{error.message}</ErrorPanel>}
            </Pblock>
        );
    }
}
