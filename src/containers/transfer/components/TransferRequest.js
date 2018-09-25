import React from "react";

import { applyTransferRequestFromUrl, getTransferLink } from "./TransferRequestHelper";

export default class TransferRequest extends React.Component {
    constructor(props) {
        super(props);

        const urlParams = new URL(document.location).searchParams;
        const request = applyTransferRequestFromUrl(urlParams);
        const link = request ? getTransferLink(request) : "/transfer";

        window.location.replace(link);
    }
    render() {
        return "Please, wait... ";
    }
}
