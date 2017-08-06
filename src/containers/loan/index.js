import React from 'react'
import { Switch, Route } from 'react-router-dom'
import newLoanMain from './newLoan/';
import LoanSelector from './repayLoan'
import RepayLoanPage from './repayLoan/RepayLoanPage'
import {PageNotFound} from 'containers/PageNotFound'


const repayLoanMain = () => (
        <Switch>
            <Route path='/loan/new' component={newLoanMain}/>
            <Route exact path='/loan/repay' component={LoanSelector}/>
            <Route path='/loan/:loanId/repay' component={RepayLoanPage}/>
            <Route component={PageNotFound}/>
        </Switch>
)

export default repayLoanMain
