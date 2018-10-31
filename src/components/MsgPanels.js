import React from "react";
import Button from "./augmint-ui/button";
import Icon from "./augmint-ui/icon";
import Container from "./augmint-ui/container";
import Message from "./augmint-ui/message";
import HashURL from "components/hash";
import styled from "styled-components";
import { default as theme } from "styles/theme";

export const StyledIcon = styled(Icon)`
    position: absolute;
    font-size: 1.8rem;
    color: ${theme.colors.secondary};
    cursor: pointer;
    &.close {
        top: 10px;
        right: 10px;
    }
    &.open {
        transform: rotate(180deg);
        margin: 0;
        top: 10px;
        right: 10px;
    }
`;

export class MsgPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dismissed: false };
        this.dismiss = this.dismiss.bind(this);
        this.toggleInfoPanel = this.toggleInfoPanel.bind(this);
    }

    dismiss() {
        if (this.props.dismissable) {
            this.setState({ dismissed: true });
        }
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    toggleInfoPanel() {
        this.props.toggleInfoPanel();
    }

    render() {
        const {
            children,
            eth,
            icon,
            dismissable,
            dismissed,
            onDismiss,
            header,
            loading,
            error,
            success,
            enableDismissBtn,
            className,
            chevron,
            ...other
        } = this.props;
        let _className = className;
        let noClose = false;

        if (loading) {
            noClose = true;
        }

        if (error) {
            _className += " error";
        }

        if (success) {
            _className += " success";
        }

        return (
            (!this.state.dismissed || !dismissable) && (
                <Container style={loading || error || success ? {} : { margin: "0 1em" }}>
                    <Message
                        onDismiss={onDismiss ? this.dismiss : null}
                        className={_className}
                        noCloseIcon={noClose}
                        {...other}
                    >
                        <h4 style={chevron && { paddingRight: "30px" }}>
                            {icon && <Icon name={icon} loading={loading} />}
                            {header}
                            {chevron && (
                                <StyledIcon
                                    name={chevron}
                                    className={this.props.showInfoPanel ? "open" : "close"}
                                    onClick={() => this.toggleInfoPanel()}
                                />
                            )}
                        </h4>

                        {children}

                        {onDismiss &&
                            enableDismissBtn && (
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
    dismissable: false,
    enableDismissBtn: true
    // chevron: false
};

export function SuccessPanel(props) {
    const { success = true, icon = "check", ...other } = props;
    return <MsgPanel success={success} icon={icon} {...other} />;
}

export function InfoPanel(props) {
    const { info = true, icon = "info", chevron, ...other } = props;
    return <MsgPanel info={info} icon={icon} chevron={chevron} {...other} />;
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
            <MsgPanel error={!!error} {...other}>
                {children}
                {error && error.message}
                {receipt && (
                    <div>
                        <HashURL hash={receipt.transactionHash} type={"tx/"} />
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
                <p style={{ paddingBottom: "8px" }}>
                    {result.txName} transaction has been sent to the Ethereum network but it's not mined yet.
                </p>
                <p style={{ paddingBottom: "8px" }}>
                    <Icon name="notifications" style={{ paddingRight: "5px" }} />
                    Wait for 12 confirmations to ensure it's accepted by network.
                </p>
                <p
                    style={{ paddingBottom: "10px" }}
                    data-testid="transactionHash"
                    data-testtxhash={result.transactionHash}
                >
                    <HashURL hash={result.transactionHash} type={"tx/"} />
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

/* it to be used on compents connected to contracts or contractData (i.e. contract.info style).*/
export function ConnectionStatus(props) {
    const { contract, error = true, size = "tiny", ...other } = props;
    const contractError = contract.error || contract.loadError || contract.connectionError;
    return contractError ? (
        <Message size={size} error={error} {...other}>
            Couldn't connect to Ethereum contract.
        </Message>
    ) : null;
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
