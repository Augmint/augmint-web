import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import augmintTokenProvider from "modules/augmintTokenProvider";
// import loanManagerProvider from "modules/loanManagerProvider";
// import lockManagerProvider from "modules/lockManagerProvider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import { Table } from "components/augmint-ui/basicTable";
import { BootstrapTable } from "components/augmint-ui/bootstrapTable";
// import BootstrapTableCustom from "./components/BootstrapTableCustom";

class BootstrapTest extends React.Component { // btw why there is no constructor?
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
                            <BootstrapTable></BootstrapTable>
                        </Pgrid.Column>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({ // CHECK this later
});

export default connect(mapStateToProps)(BootstrapTest);
