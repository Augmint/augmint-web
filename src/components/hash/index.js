import React from "react";
import store from "modules/store";

export default function HashURL(props) {
    const { hash, network, children, type, ...other } = props;
    const web3 = store.getState().web3Connect;
    const url = process.env["REACT_APP_LINK_NETWORK_" + network || web3.network.id];
    const _children = children !== undefined ? children : "View on Etherscan.";

    return (
        <a href={url + type + hash} target="_blank" {...other}>
            {_children}
        </a>
    );
}
