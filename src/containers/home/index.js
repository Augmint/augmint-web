import React from 'react'
import {Grid, Row, Col, Jumbotron, Panel} from 'react-bootstrap'

const myAccountTitle = ( <h3>My UCD Account</h3> );
const myLoanTitle = ( <h3>My UCD Loans</h3> );

export default () => (
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
            <Col xs={8} md={8}>
                <Panel header={myAccountTitle}>
                    <p>TODO</p>
                </Panel>
            </Col>

            <Col xs={4} md={4}>
                <Panel header={myLoanTitle}>
                    <p>TODO</p>
                </Panel>
            </Col>
        </Row>
    </Grid>
)
