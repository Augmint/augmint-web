import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import { Link } from "react-router-dom";
import { ConnectionStatus } from "components/MsgPanels";

export class AccountInfo extends React.Component {
    render() {
        const {
            header,
            showMyAccountLink,
            account,
            tokenUcd,
            userBalancesIsLoading
        } = this.props;
        return (
            <Pblock
                loading={
                    tokenUcd.isLoading ||
                    (!tokenUcd.isConnected && !tokenUcd.connectionError) ||
                    userBalancesIsLoading
                }
                header={header}
            >
                <ConnectionStatus contract={tokenUcd} />

                <p>Account: {account.address}</p>
                <p>
                    ETH: {account.ethBalance}
                    {account.ethPendingBalance !== "?" &&
                        account.ethPendingBalance - account.ethBalance !==
                            0 && (
                            <span>
                                {" "}
                                (Pending:{" "}
                                {account.ethPendingBalance -
                                    account.ethBalance}{" "}
                                )
                            </span>
                        )}
                </p>
                <p>
                    ACD: {account.ucdBalance}
                    {account.ucdPendingBalance !== "?" &&
                        account.ucdPendingBalance - account.ucdBalance !==
                            0 && (
                            <span>
                                {" "}
                                (Pending:{" "}
                                {account.ucdPendingBalance -
                                    account.ucdBalance}{" "}
                                )
                            </span>
                        )}
                </p>
                {showMyAccountLink && <Link to="/account">More details</Link>}
            </Pblock>
        );
    }
}

AccountInfo.defaultProps = {
    header: "My Account",
    showMyAccountLink: false
};

const mapStateToProps = state => ({
    userBalancesIsLoading: state.userBalances.isLoading,
    tokenUcd: state.tokenUcd
});

export default connect(mapStateToProps)(AccountInfo);
