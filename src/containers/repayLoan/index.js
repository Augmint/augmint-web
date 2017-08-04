import React from 'react'
import { Switch, Route } from 'react-router-dom'
import {PageHeader, Grid, Row, Col} from 'react-bootstrap';
import LoanSelector from './LoanSelector'
import RepayLoanPage from './RepayLoanPage'

const repayLoanMain = () => (
    <Grid>
        <Row>
            <Col>
                <PageHeader>
                    Repay your loan
                </PageHeader>
            </Col>
        </Row>
        <Switch>
            <Route exact path='/loan/repay' component={LoanSelector}/>
            <Route path='/loan/repay/:loanId' component={RepayLoanPage}/>
        </Switch>
    </Grid>

)

export default repayLoanMain
