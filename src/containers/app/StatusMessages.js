/* TODO: this doesn't work yet https://stackoverflow.com/questions/34403269/what-is-the-best-way-to-deal-with-a-fetch-error-in-react-redux */
import React from 'react'
import { connect } from 'react-redux'

class StatusMessages extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
            {this.props.errors ? this.props.errors : ""}
            {this.props.successes ? this.props.successes : ""}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    errors: state.errors,
    successes: state.successes
})

export default connect(
    mapStateToProps
)(StatusMessages)
