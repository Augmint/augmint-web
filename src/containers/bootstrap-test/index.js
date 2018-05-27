import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";

class BootstrapTest extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        loanManagerProvider();
        lockManagerProvider();
    }

    render() {
        return (
            <EthereumState>
                <Psegment>
                    <Pgrid columns={1}>
                        <Pgrid.Column>
                        </Pgrid.Column>

                        <Pheader header="Reserves" />
                        <Pgrid.Column>
                        </Pgrid.Column>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    augmintToken: state.augmintToken,
    loanManager: state.loanManager,
    lockManager: state.lockManager,
    monetarySupervisor: state.monetarySupervisor,
    rates: state.rates
});

export default connect(mapStateToProps)(BootstrapTest);
