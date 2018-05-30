import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import { BootstrapTable } from "components/augmint-ui/bootstrapTable";

class BootstrapTest extends React.Component { 
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
    }

    render() {
        return (
            <EthereumState>
                <Psegment>
                    <Pgrid columns={1}>
                        <Pheader header="Transaction History" />
                        <Pgrid.Column>
                            <BootstrapTable></BootstrapTable> {/* COULD BE SEPARATED to TransactionHistory.js component */}
                        </Pgrid.Column>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps)(BootstrapTest);
