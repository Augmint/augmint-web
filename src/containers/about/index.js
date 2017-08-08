import React from "react";
import { Grid, Row, Col, Jumbotron } from "react-bootstrap";

export default () =>
    <Grid>
        <Row>
            <Col>
                <Jumbotron>
                    <h1>About UCD</h1>
                    <p>Hello UCD!</p>
                    <p>UCD is ...</p>
                </Jumbotron>
            </Col>
        </Row>
    </Grid>;
