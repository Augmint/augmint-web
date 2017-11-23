import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Link } from "react-router-dom";
import tokenUcdProvider from "modules/tokenUcdProvider";
import ratesProvider from "modules/ratesProvider";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { TokenUcdStats } from "components/TokenUcdStats";
import { EthereumState } from "containers/app/EthereumState";
import { Button } from "semantic-ui-react";

class TokenUcd extends React.Component {
    componentDidMount() {
        connectWeb3();
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
            <EthereumState>
                <Psegment>
                    <Pheader header="Augmint Reserves" />

                    <Pgrid columns={1}>
                        <Pgrid.Column>
                            <TokenUcdStats
                                size="small"
                                showInUsd
                                tokenUcd={tokenUcd}
                                rates={rates}
                            />
                        </Pgrid.Column>
                        <Pgrid.Column>
                            <Button
                                content="Loans to Collect"
                                as={Link}
                                to="/loan/collect"
                                icon="right chevron"
                                labelPosition="right"
                                basic
                                size="large"
                            />
                        </Pgrid.Column>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.web3Connect.userAccount,
    accounts: state.web3Connect.accounts,
    balance: state.web3Connect.balance,
    isLoading: state.web3Connect.isLoading,
    isConnected: state.web3Connect.isConnected,
    web3Instance: state.web3Connect.web3Instance,

    tokenUcd: state.tokenUcd,
    rates: state.rates,
    loanManagerAddress: state.loanManager.contract.address
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            refreshTokenUcd
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(TokenUcd);
