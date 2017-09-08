import React from "react";
import { Container, Message, Button } from "semantic-ui-react";
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
            header,
            ...other
        } = this.props;

        return (
            !this.state.dismissed && (
                <Container style={{ margin: "1em" }}>
                    <Message {...other}>
                        <Message.Header>{header}</Message.Header>
                        {children !== null && children}
                        {dismissable && (
                            <Button onClick={this.dismiss}>OK</Button>
                        )}
                    </Message>
                </Container>
            )
        );
    }
}
MsgPanel.defaultProps = {
    dismissed: false
};

export function SuccessPanel(props) {
    return <MsgPanel success {...props} />;
}

export function InfoPanel(props) {
    return <MsgPanel info {...props} />;
}

export function WarningPanel(props) {
    return <MsgPanel warning {...props} />;
}

export function ErrorPanel(props) {
    return <MsgPanel error {...props} />;
}

export class EthSubmissionErrorPanel extends React.Component {
    render() {
        let { children, error, ...other } = this.props;
        return (
            <MsgPanel error {...other}>
                {children}
                {error && error.title}
                {error != null &&
                error.eth && (
                    <div>
                        <p>Tx hash: {error.eth.tx}</p>
                        <p>
                            Gas used: {error.eth.gasUsed} (from{" "}
                            {error.eth.gasProvided} provided)
                        </p>
                    </div>
                )}
                {error != null &&
                error.details != null &&
                error.details.message && (
                    <ErrorDetails>{error.details.message}</ErrorDetails>
                )}
            </MsgPanel>
        );
    }
}

EthSubmissionErrorPanel.defaultProps = {
    header: <h3>Submission error</h3>,
    dismissable: true
};

export class EthSubmissionSuccessPanel extends React.Component {
    render() {
        var { children, eth, ...other } = this.props;

        return (
            <MsgPanel {...other}>
                {children}
                <small>
                    <p>Tx hash: {eth.tx}</p>
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
    success: true,
    header: <h3>Successfull transaction</h3>,
    dismissable: true
};
