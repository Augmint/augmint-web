import React from "react";
import Button from "./augmint-ui/button";
import Icon from "./augmint-ui/icon";
import Container from "./augmint-ui/container";
import Message from "./augmint-ui/message";

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
        const { children, eth, icon, dismissable, dismissed, onDismiss, header, loading, error, ...other } = this.props;
        return (
            (!this.state.dismissed || !dismissable) && (
                <Container style={{ margin: "1em" }}>
                    <Message onDismiss={onDismiss ? this.dismiss : null} className={error ? "error" : ""} {...other}>
                        <h3>
                            {icon && <Icon name={icon} loading={loading} />} {header}
                        </h3>

                        {children}

                        {onDismiss && (
                            <Button data-testid="msgPanelOkButton" className="grey" onClick={this.dismiss}>
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
    const { success = true, icon = "check", ...other } = props;
    return <MsgPanel success={success} icon={icon} {...other} />;
}

export function InfoPanel(props) {
    const { info = true, icon = "info", ...other } = props;
    return <MsgPanel info={info} icon={icon} {...other} />;
}

export function WarningPanel(props) {
    return <MsgPanel warning {...props} />;
}

export function ErrorPanel(props) {
    return <MsgPanel error {...props} />;
}

export function LoadingPanel(props) {
    const { info = true, icon = "circle notched", loading = true, ...other } = props;
    return <MsgPanel info={info} icon={icon} loading={loading} {...other} />;
}

export class EthSubmissionErrorPanel extends React.Component {
    render() {
        const { children, error, ...other } = this.props;
        const receipt = error && error.receipt ? error.receipt : null;
        const panel = !error ? null : (
            <MsgPanel error={error ? true : false} {...other}>
                {children}
                {error && error.message}
                {receipt && (
                    <div>
                        <p>Tx hash: {receipt.transactionHash}</p>
                        <p>Gas used: {receipt.gasUsed}</p>
                    </div>
                )}
                {error && <ErrorDetails details={error.details} />}
            </MsgPanel>
        );
        return panel;
    }
}

EthSubmissionErrorPanel.defaultProps = {
    header: "Submission error",
    dismissable: false // pass onDismiss={() => {clearSubmitErrors();}} instead
};

export class EthSubmissionSuccessPanel extends React.Component {
    render() {
        const { children, result, testid = "EthSubmissionSuccessPanel", ...other } = this.props;

        return (
            <MsgPanel data-testid={testid} {...other}>
                {children}
                <p>{result.txName} transaction has been sent to Ethereum network but it's not mined yet.</p>
                <p>Wait for 12 confirmations to ensure it's accepted by network.</p>
                <p>
                    <small>
                        Tx hash: <span data-testid="transactionHash">{result.transactionHash}</span>
                        <br />
                    </small>
                </p>
            </MsgPanel>
        );
    }
}

EthSubmissionSuccessPanel.defaultProps = {
    info: true,
    header: "Transaction sent",
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
