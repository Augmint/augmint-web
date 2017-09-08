import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import tokenUcdProvider from "modules/tokenUcdProvider";
import ratesProvider from "modules/ratesProvider";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { TokenUcdStats } from "components/TokenUcdStats";
import { EthereumState } from "containers/app/EthereumState";

class TokenUcd extends React.Component {
    componentDidMount() {
        ratesProvider();
        tokenUcdProvider();
    }

    handleTokenUcdRefreshClick = e => {
        e.preventDefault();
        this.props.refreshTokenUcd();
    };

    render() {
        const { tokenUcd, rates } = this.props;

        return (
            <div>
                <EthereumState />
                <Psegment>
                    <Pheader header="Token UCD" />

                    <Pgrid columns={1}>
                        <Pgrid.Row>
                            <Pgrid.Column>
                                <TokenUcdStats
                                    size="small"
                                    showInUsd
                                    tokenUcd={tokenUcd}
                                    rates={rates}
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                        <Pgrid.Row>
                            <Pgrid.Column>
                                <Link
                                    className="btn btn-link"
                                    to="/loan/collect"
                                >
                                    <h3>Loans to Collect</h3>
                                </Link>
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.web3Connect.userAccount,
    accounts: state.web3Connect.accounts,
    balance: state.web3Connect.balance,
    isLoading: state.web3Connect.isLoading,
    isConnected: state.web3Connect.isConnected,
    web3ConnectionId: state.web3Connect.web3ConnectionId,
    web3Instance: state.web3Connect.web3Instance,

    tokenUcd: state.tokenUcd,
    rates: state.rates,
    loanManagerAddress: state.tokenUcd.info.loanManagerAddress
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            refreshTokenUcd
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(TokenUcd);
