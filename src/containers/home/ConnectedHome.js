import React from "react";
import { connect } from "react-redux";
import { Hero } from "./Hero";
import { DcmOverview } from "./DcmOverview";
import { ProjectStatus } from "./ProjectStatus";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { AugmintStats } from "components/AugmintStats";
import { Psegment } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import { Container, Header } from "semantic-ui-react";

class ConnectedHome extends React.Component {
    componentDidMount() {
        augmintTokenProvider();
    }
    render() {
        const { augmintToken } = this.props;
        return (
            <div>
                <Hero />
                <DcmOverview />
                <ProjectStatus />
                <EthereumState>
                    <Psegment>
                        <Container>
                            <Header textAlign="center" style={{ fontSize: "2em" }}>
                                A-EUR status
                            </Header>
                            <AugmintStats augmintToken={augmintToken} showDetailsLink />
                        </Container>
                    </Psegment>
                </EthereumState>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    augmintToken: state.augmintToken
});

export default connect(mapStateToProps)(ConnectedHome);
