import React from "react";
import { Panel, Button } from "react-bootstrap";
import ErrorDetails from "components/ErrorDetails";

export default class MsgPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dismissed: false };
        this.dismiss = this.dismiss.bind(this);
    }

    dismiss() {
        this.setState({ dismissed: true });
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    render() {
        let {
            children,
            eth,
            dismissable,
            dismissed,
            onDismiss,
            ...other
        } = this.props;

        return (
            !this.state.dismissed &&
            <Panel {...other}>
                {children !== null && children}
                {dismissable && <Button onClick={this.dismiss}>OK</Button>}
            </Panel>
        );
    }
}
MsgPanel.defaultProps = {
    dismissed: false
};

export function SuccessPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "success";
    return <MsgPanel bsStyle={_bsStyle} {...other} />;
}

export function InfoPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "info";
    return <MsgPanel bsStyle={_bsStyle} {...other} />;
}

export function WarningPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "warning";
    return <MsgPanel bsStyle={_bsStyle} {...other} />;
}

export function ErrorPanel(props) {
    var { bsStyle, ...other } = props;
    const _bsStyle = bsStyle ? bsStyle : "danger";
    return <MsgPanel bsStyle={_bsStyle} {...other} />;
}

export class EthSubmissionErrorPanel extends React.Component {
    render() {
        let { children, error, ...other } = this.props;
        return (
            <MsgPanel {...other}>
                {children}
                {error && error.title}
                {error != null &&
                    error.eth &&
                    <div>
                        <p>
                            Tx hash: {error.eth.tx}
                        </p>
                        <p>
                            Gas used: {error.eth.gasUsed} (from{" "}
                            {error.eth.gasProvided} provided)
                        </p>
                    </div>}
                {error != null &&
                    error.details != null &&
                    error.details.message &&
                    <ErrorDetails>
                        {error.details.message}
                    </ErrorDetails>}
            </MsgPanel>
        );
    }
}

EthSubmissionErrorPanel.defaultProps = {
    bsStyle: "danger",
    header: <h3>Submission error</h3>,
    dismissable: true,
    collapsible: false
};

export class EthSubmissionSuccessPanel extends React.Component {
    render() {
        var { children, eth, ...other } = this.props;

        return (
            <MsgPanel {...other}>
                {children}
                <small>
                    <p>
                        Tx hash: {eth.tx}
                    </p>
                    <p>
                        Gas used: {eth.gasUsed} (from {eth.gasProvided}{" "}
                        provided)
                    </p>
                </small>
            </MsgPanel>
        );
    }
}

EthSubmissionSuccessPanel.defaultProps = {
    bsStyle: "success",
    header: <h3>Successfull transaction</h3>,
    dismissable: true,
    collapsible: false
};
