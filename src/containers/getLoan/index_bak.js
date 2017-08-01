import React from 'react'
import { Grid, Row, Col, PageHeader} from 'react-bootstrap';
import LoanSelector from './LoanSelector'
import { Switch, Route } from 'react-router-dom'

export default class Loan extends React.Component {

    constructor(props) {
        super(props);
        this.selectLoanClick = this.selectLoanClick.bind(this);
        this.state = {
            selectedLoanProduct: null
        }
    }

    selectLoanClick(productId) {
        console.log("selected product id:", productId);
        this.setState( { selectedLoanProduct: productId });
    }

    render() {
        return(
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>
                            Get a UCD loan
                        </PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={12}>
                        {
                        this.state.selectedLoanProduct != null ?
                            this.state.selectedLoanProduct :
                            <LoanSelector selectCb={this.selectLoanClick} />
                        }
                    </Col>
                </Row>
            </Grid>
        )
    }
}
