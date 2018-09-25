import React from "react";
import { withRouter } from "react-router-dom";
import { Psegment } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";

import { applyTransferRequestFromUrl, getTransferLink } from "./TransferRequestHelper";

class TransferRequest extends React.Component {
    constructor(props) {
        super(props);

        this.state = { error: null };

        const urlParams = new URL(document.location).searchParams;
        try {
            const request = applyTransferRequestFromUrl(urlParams);
            const link = request ? getTransferLink(request) : "/transfer";

            this.props.history.replace(link);
        } catch (e) {
            console.log(e);
            this.state.error = e;
        }
    }
    render() {
        return (
            this.state.error && (
                <Psegment>
                    <ErrorPanel header="Transfer request error">
                        <p>{this.state.error.toString()}</p>
                    </ErrorPanel>
                </Psegment>
            )
        );
    }
}

export default withRouter(TransferRequest);
