import React from "react";
import { connect } from "react-redux";
import { Hero } from "./Hero";
import tokenUcdProvider from "modules/tokenUcdProvider";
import { TokenUcdStats } from "components/TokenUcdStats";
import { Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";

class ConnectedHome extends React.Component {
    componentDidMount() {
        tokenUcdProvider();
    }
    render() {
        const { tokenUcd } = this.props;
        return (
            <div>
                <Hero />
                <EthereumState />
                <Psegment>
                    <Pgrid>
                        <Pgrid.Row columns={1}>
                            <Pgrid.Column>
                                <TokenUcdStats
                                    tokenUcd={tokenUcd}
                                    showTokenUcdLink
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    tokenUcd: state.tokenUcd
});

export default connect(mapStateToProps)(ConnectedHome);
