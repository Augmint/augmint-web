import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, Jumbotron, Button } from "react-bootstrap";
import tokenUcdProvider from "modules/tokenUcdProvider";
import AccountInfo from "components/AccountInfo";
import { TokenUcdStats } from "components/TokenUcdStats";

class Home extends React.Component {
    componentDidMount() {
        tokenUcdProvider();
    }
    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        <Jumbotron>
                            <h1>UCD Playground</h1>
                            <p>
                                Proof-of-concept implementation of a stable
                                cryptocurrency based on the DCM (Digital Credit
                                Money) concept.
                            </p>
                            <p>
                                Read more on our
                                <Button
                                    bsStyle="link"
                                    href="https://github.com/DecentLabs/ucd-poc"
                                    target="_blank"
                                >
                                    Github page
                                </Button>
                            </p>
                        </Jumbotron>
                    </Col>
                </Row>

                <Row>
                    <Col xs={6} md={6}>
                        <AccountInfo
                            account={this.props.userAccount}
                            showMyAccountLink
                        />
                    </Col>

                    <Col xs={6} md={6}>
                        <TokenUcdStats
                            tokenUcd={this.props.tokenUcd}
                            showTokenUcdLink
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    tokenUcd: state.tokenUcd,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(Home);
