import React from 'react'
import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
    increment,
    incrementAsync,
    decrement,
    decrementAsync
} from '../../modules/counter'
import {Grid, Row, Col} from 'react-bootstrap'

const Counter = props => (
    <Grid>
        <Row>
            <Col>
                <h1>Counter</h1>
                <p>Count: {props.count}</p>

                <p>
                    <button onClick={props.increment} disabled={props.isIncrementing}>Increment</button>
                    <button onClick={props.incrementAsync} disabled={props.isIncrementing}>Increment Async</button>
                </p>
            </Col>
        </Row>
        <Row>
            <Col>
                <p>
                    <button onClick={props.decrement} disabled={props.isDecrementing}>Decrement</button>
                    <button onClick={props.decrementAsync} disabled={props.isDecrementing}>Decrement Async</button>
                </p>
                
                <p><button onClick={() => props.changePage()}>Go to about page via redux</button></p>
            </Col>
        </Row>
    </Grid>
)

const mapStateToProps = state => ({
    count: state.counter.count,
    isIncrementing: state.counter.isIncrementing,
    isDecrementing: state.counter.isDecrementing
})

const mapDispatchToProps = dispatch => bindActionCreators({
    increment,
    incrementAsync,
    decrement,
    decrementAsync,
    changePage: () => push('/about-us')
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Counter)
