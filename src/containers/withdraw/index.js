import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment, Pgrid, Pblock } from "components/PageLayout";
import Header from "components/augmint-ui/header";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import AddWithdrawForm from "./components/AddWithdrawForm";
import { EthereumState } from "containers/app/EthereumState";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";
import { TOKEN_SELL } from "modules/reducers/orders";

class WithdrawHome extends React.Component {
    constructor(props) {
        super(props);
        this.toggleOrderBook = this.toggleOrderBook.bind(this);
        this.state = {
            orderBookDirection: TOKEN_SELL
        };
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }

    toggleOrderBook(direction) {
        this.setState({
            orderBookDirection: direction
        });
    }

    render() {
        const { userAccount, exchange, rates } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Add & Withdraw funds" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                                <Pblock header="€ &harr; A€ on partner exchange">
                                    <Header />
                                </Pblock>
                                <AddWithdrawForm exchange={exchange} rates={rates} user={userAccount} />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    userAccount: state.userBalances.account,
    exchange: state.exchange,
    orders: state.orders,
    rates: state.rates,
    trades: state.trades
});

export default connect(mapStateToProps)(WithdrawHome);
