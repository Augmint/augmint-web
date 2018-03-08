import React from "react";
import { Container, Message, Button, Icon } from "semantic-ui-react";

export default class MsgPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dismissed: false };
        this.dismiss = this.dismiss.bind(this);
    }

    dismiss() {
        if (this.props.dismissable) {
            this.setState({ dismissed: true });
        }
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    render() {
        let { children, eth, dismissable, dismissed, onDismiss, header, ...other } = this.props;
        return (
            (!this.state.dismissed || !dismissable) && (
                <Container style={{ margin: "1em" }}>
                    <Message onDismiss={onDismiss ? this.dismiss : null} {...other}>
                        <Message.Header>{header}</Message.Header>
                        {children !== null && children}
                        {onDismiss && (
                            <Button data-testid="msgPanelOkButton" as="a" onClick={this.dismiss}>
                                OK
                            </Button>
                        )}
                    </Message>
                </Container>
            )
        );
    }
}
MsgPanel.defaultProps = {
    dismissed: false,
    dismissable: false
};

export function SuccessPanel(props) {
    return <MsgPanel success {...props} />;
}

export function InfoPanel(props) {
    const { info = true, icon = "info", header, ...other } = props;
    return (
        <MsgPanel info={info} icon={icon ? true : false} {...other}>
            {icon && <Icon name={icon} />}
            <Message.Header>{header}</Message.Header>
            {props.children}
        </MsgPanel>
    );
}

export function WarningPanel(props) {
    return <MsgPanel warning {...props} />;
}

export function ErrorPanel(props) {
    return <MsgPanel error {...props} />;
}

export function LoadingPanel(props) {
    const { info = true, header, ...other } = props;
    return (
        <MsgPanel info={info} icon {...other}>
            <Icon name="circle notched" loading />
            <Message.Header>{header}</Message.Header>
            {props.children}
        </MsgPanel>
    );
}

export class EthSubmissionErrorPanel extends React.Component {
    render() {
        const { children, error, ...other } = this.props;
        const txResult = error && error.txResult ? error.txResult : null;
        return (
            <MsgPanel error {...other}>
                {children}
                {error && error.message}
                {txResult && (
                    <div>
                        <p>Tx hash: {txResult.receipt.transactionHash}</p>
                        <p>
                            Gas used: {txResult.receipt.gasUsed} (from {error.gasEstimate} provided)
                        </p>
                    </div>
                )}
                {error && <ErrorDetails details={error.details} />}
            </MsgPanel>
        );
    }
}

EthSubmissionErrorPanel.defaultProps = {
    header: <h3>Submission error</h3>,
    dismissable: false // pass onDismiss={() => {clearSubmitErrors();}} instead
};

export class EthSubmissionSuccessPanel extends React.Component {
    render() {
        const { children, result, testid = "EthSubmissionSuccessPanel", ...other } = this.props;

        return (
            <MsgPanel data-testid={testid} {...other}>
                {children}
                <small>
                    <p>
                        Tx hash:{" "}
                        <small data-testid="transactionHash">{result.eth.result.receipt.transactionHash}</small>
                    </p>
                    <p>
                        Gas used: {result.eth.result.receipt.gasUsed.toString()} (from {result.eth.gasEstimate}{" "}
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

export function ConnectionStatus(props) {
    const { contract, error = true, size = "tiny", ...other } = props;
    return (
        contract.connectionError && (
            <Message size={size} error={error} {...other}>
                Couldn't connect to Ethereum contract.
            </Message>
        )
    );
}

export function ErrorDetails(props) {
    const { header = "Error details:", style = { fontSize: "0.8em", overflow: "auto" }, details } = props;

    return !details ? null : (
        <div>
            <p>{header}</p>
            {details && <pre style={style}>{details.message ? details.message : details}</pre>}
        </div>
    );
}
