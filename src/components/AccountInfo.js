import React from "react";
import { Panel } from "react-bootstrap";
import { Link } from "react-router-dom";

export default class AccountInfo extends React.Component {
    render() {
        const { header, showMyAccountLink, account } = this.props;
        return (
            <Panel header={header}>
                <p>
                    Account: {account.address}
                </p>
                <p>
                    Balances: {account.ethBalance} ETH | {account.ucdBalance}{" "}
                    UCD
                </p>
                {showMyAccountLink &&
                    <Link to="/account">My account details</Link>}
            </Panel>
        );
    }
}

AccountInfo.defaultProps = {
    header: <h3>My Account</h3>,
    showMyAccountLink: false
};
