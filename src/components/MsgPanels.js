import React from 'react'
import {Panel} from 'react-bootstrap';
import stringifier from 'stringifier'

// export function stringifyError (err, filter, space) {
//     var plainObject = {};
//     Object.getOwnPropertyNames(err).forEach(function(key) {
//         plainObject[key] = err[key];
//     });
//     return JSON.stringify(plainObject, filter, space);
// };

const stringify = stringifier( {maxDepth: 3, indent: '   ', lineSeparator: '<br/>'});

export default function MsgPanel(props) {
    return(
        <Panel header={props.header}
            bsStyle={props.bsStyle} collapsible={props.collapsible} >
            {props.children}
        </Panel>
    );
}

export function SuccessPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "success"
    return(
        <MsgPanel bsStyle={_bsStyle} {...other}/>
    )
}

export function WarningPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "warning"
    return(
        <MsgPanel bsStyle={_bsStyle} {...other}/>
    )
}

export function ErrorPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "danger"
    return(
        <MsgPanel bsStyle={_bsStyle} {...other}/>
    )
}

export function EthSubmissionErrorPanel(props) {
    var { bsStyle, header, collapsible, children, error, ...other } = props;
    let _bsStyle = bsStyle ? bsStyle : "danger"
    let _header = props.header ? props.header :
        "Submission error";
    _header += props.error.title ? ": " + props.error.title : props.error;
    return(
        <MsgPanel header={_header} bsStyle={_bsStyle} collapsible={true} {...other}>
            {children}
            { error.eth &&
                <div>
                    <p>Tx hash: {error.eth.tx}</p>
                    <p>Gas used: {error.eth.gasUsed} (from {error.eth.gasProvided} provided)</p>
                </div>
            }
            {/* TODO: this doesn't wrap */}
            <div className="white-space: pre-wrap">
                { stringify( error.details.message) }
            </div>

        </MsgPanel>
    )
}

export function EthSubmissionSuccessPanel(props) {
    var { bsStyle, header, collapsible, children, eth, ...other } = props;
    let _bsStyle = bsStyle ? bsStyle : "success"
    let _header = props.header ? props.header :
        (<h3>Successfull transaction</h3>);
    let _collapsible = typeof collapsible === "undefined" ? false : collapsible;
    return(
        <MsgPanel header={_header} bsStyle={_bsStyle} collapsible={_collapsible} {...other}>
            {children}
            <p>Tx hash: {eth.tx}</p>
            <small>
                <p>Gas used: {eth.gasUsed} (from {eth.gasProvided} provided)</p>
            </small>
        </MsgPanel>
    )
}
