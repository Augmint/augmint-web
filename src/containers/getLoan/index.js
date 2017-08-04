import React from 'react'
import { Switch, Route } from 'react-router-dom'
import {PageHeader, Grid, Row, Col} from 'react-bootstrap';
import LoanProductSelector from './LoanProductSelector'
import NewLoan from './NewLoan'

const getLoanMain = () => (
    <Grid>
        <Row>
            <Col>
                <PageHeader>
                    Get a UCD loan
                </PageHeader>
            </Col>
        </Row>

                <Switch>
                    <Route exact path='/getLoan' component={LoanProductSelector}/>
                    <Route path='/getLoan/:loanProductId' component={NewLoan}/>
                </Switch>

    </Grid>
)


export default getLoanMain
