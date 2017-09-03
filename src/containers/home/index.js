import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, Jumbotron } from "react-bootstrap";
import tokenUcdProvider from "modules/tokenUcdProvider";
import AccountInfo from "components/AccountInfo";
import TokenUcdInfo from "components/TokenUcdInfo";

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
                            <p>Hello UCD!</p>
                            <p>UCD is ...</p>
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
                        <TokenUcdInfo
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
