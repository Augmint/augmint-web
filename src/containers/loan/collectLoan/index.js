import React from "react";
import CollectLoanList from "./CollectLoanList";
import { PageHeader, Grid, Row, Col } from "react-bootstrap";

const collectLoanMain = () =>
    <Grid>
        <Row>
            <Col>
                <PageHeader>Collect loans</PageHeader>
            </Col>
        </Row>
        <CollectLoanList />
    </Grid>;

export default collectLoanMain;
