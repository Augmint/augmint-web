import React from "react";
import { Route } from "react-router-dom";
import NewLoanPage from "./NewLoanPage";
import LoanProductSelector from "./LoanProductSelector";
import { PageHeader, Grid, Row, Col } from "react-bootstrap";

const newLoanMain = () =>
    <Grid>
        <Row>
            <Col>
                <PageHeader>Get a UCD loan</PageHeader>
            </Col>
        </Row>
        <Row>
            <Route exact path="/loan/new" component={LoanProductSelector} />
            <Route path="/loan/new/:loanProductId" component={NewLoanPage} />
        </Row>
    </Grid>;

export default newLoanMain;
