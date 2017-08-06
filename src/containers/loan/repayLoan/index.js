import React from "react";
import {Route} from 'react-router-dom'
import RepayLoanPage from './RepayLoanPage';
import LoanSelector from './LoanSelector'
import { PageHeader, Grid, Row, Col } from "react-bootstrap";

const repayLoanMain = () =>
    <Grid>
        <Row>
            <Col>
                <PageHeader>Repay loan</PageHeader>
            </Col>
        </Row>
        <Row>
            <Route exact path='/loan/repay' component={LoanSelector}/>
            <Route path='/loan/repay/:loanId' component={RepayLoanPage}/>
        </Row>
    </Grid>;

export default repayLoanMain;
