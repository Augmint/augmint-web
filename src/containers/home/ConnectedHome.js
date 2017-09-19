import React from "react";
import { connect } from "react-redux";
import { Hero } from "./Hero";
import { DcmOverview } from "./DcmOverview";
import { ProjectStatus } from "./ProjectStatus";
import tokenUcdProvider from "modules/tokenUcdProvider";
import { TokenUcdStats } from "components/TokenUcdStats";
import { Psegment } from "components/PageLayout";
import { EthereumState } from "containers/app/EthereumState";
import { Container, Header } from "semantic-ui-react";

class ConnectedHome extends React.Component {
    componentDidMount() {
        tokenUcdProvider();
    }
    render() {
        const { tokenUcd } = this.props;
        return (
            <div>
                <Hero />
                <DcmOverview />
                <ProjectStatus />
                <EthereumState>
                    <Psegment>
                        <Container>
                            <Header
                                textAlign="center"
                                style={{ fontSize: "2em" }}
                            >
                                UCD status
                            </Header>
                            <TokenUcdStats
                                tokenUcd={tokenUcd}
                                showTokenUcdLink
                            />
                        </Container>
                    </Psegment>
                </EthereumState>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    tokenUcd: state.tokenUcd
});

export default connect(mapStateToProps)(ConnectedHome);
