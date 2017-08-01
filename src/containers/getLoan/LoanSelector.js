import React from 'react'
import { connect } from 'react-redux'
import LoanProductDetails from '../../components/LoanProductDetails'
import { ListGroup, Panel, Well, Grid, Row, Col} from 'react-bootstrap';

function LoanProductList(props) {
    let products = props.products;
    // TODO: this causing a warning, table nested in <p>. Bootstrap has class for table within panel...
    const listItems = products == null ? <p>Loading products...</p> :
        products.filter( (item) => { return item.isActive}).map( (prod, index) =>
            <div key={`loanProdDiv-${prod.id}`}>
                <LoanProductDetails product={prod} showSelect={true}/>
            </div>
    );

    return (
        <ListGroup>
            { listItems }
        </ListGroup>
    );
}

class LoanSelector extends React.Component {

render() {
    return(
        <Grid>
            <Row>
                <Col xs={4} md={4}>
                    <Well>
                        You can get UCD for ETH collateral. <br/>
                        When you repay the UCD on maturity you will get back all of your ETH.<br/>
                        If you decide not to repay the UCD loan then your ETH will be taken to the UCD reserves.
                    </Well>
                </Col>
                <Col xs={8} md={8}>
                    <Panel header={<h2>Select your loan product</h2>}>
                        <LoanProductList products={this.props.loanProducts} />
                    </Panel>
                </Col>
            </Row>
        </Grid>
    )
}
}

const mapStateToProps = state => ({
    loanProducts: state.loanManager.products
})

export default connect(
    mapStateToProps
)(LoanSelector)
