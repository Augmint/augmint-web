import React from "react";
import store from "modules/store";

export default function HashURL(props) {
    const { hash, title, type } = props;
    const web3 = store.getState().web3Connect;
    const url = process.env["REACT_APP_LINK_NETWORK_" + web3.network.id];
    const _title = title !== undefined ? title : "View on Etherscan.";

    return (
        <a href={url + type + hash} target="_blank">
            {_title}
        </a>
    );
}
