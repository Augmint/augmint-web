import React from "react";
import Icon from "components/augmint-ui/icon";
import Button from "components/augmint-ui/button";

import { shortAccountAddresConverter } from "utils/converter";
import { StyledContainer, StyledClicked, StyledHint, StyledHintBtn } from "./styles";

export default class AccountAddress extends React.Component {
    constructor(props) {
        super(props);
        this.showHint = this.showHint.bind(this);
        this.hideHint = this.hideHint.bind(this);
        this.copyAddress = this.copyAddress.bind(this);
        this.state = {
            showHint: false
        };
    }

    showHint(timeout) {
        this.setState({ showHint: true });
        this.copyAddress();
        timeout &&
            setTimeout(() => {
                this.hideHint();
            }, 2000);
    }

    hideHint() {
        this.setState({
            showHint: false
        });
    }

    copyAddress(e) {
        const el = document.createElement("textarea");
        el.value = this.props.address;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }

    render() {
        const { address, showCopyIcon, title, shortAddress, className, showCopyLink } = this.props;
        const _title = title !== undefined ? title : "Account: ";
        const _className = this.state.showHint ? className + " showHint" : className;
        const ShortAddress = () => _title + (shortAddress === true ? shortAccountAddresConverter(address) : address);

        const ContainerWBtn = () => {
            return (
                <StyledContainer className={className + " container"}>
                    <ShortAddress />
                    {showCopyIcon && (
                        <Icon
                            name="copy"
                            style={{ paddingLeft: 5 }}
                            onClick={e => this.showHint(true)}
                            onMouseLeave={e => this.hideHint()}
                        />
                    )}
                    <Button
                        content="Copy"
                        data-testid="loansToCollectButton"
                        onClick={e => this.showHint(true)}
                        icon="copy"
                        labelposition="left"
                        iconsize="small"
                        style={{ marginTop: "10px", marginBottom: "20px" }}
                        className="ghost naked icon left"
                    />
                    <Button
                        content="Copy"
                        data-testid="loansToCollectButton"
                        onClick={e => this.showHint(true)}
                        icon="copy"
                        labelposition="left"
                        style={{ marginBottom: "20px" }}
                        className="grey icon left"
                    />
                    <StyledHintBtn className={_className} id="StyledHinBtn">
                        <Icon name="check" style={{ marginRight: "5px", color: "green" }} />
                        Copied!
                    </StyledHintBtn>
                </StyledContainer>
            );
        };

        const ContainerWHint = () => {
            return (
                <StyledContainer
                    onClick={e => this.showHint(true)}
                    onMouseLeave={e => this.hideHint()}
                    className={_className}
                    id="StyledContainer"
                >
                    <ShortAddress />
                    {showCopyIcon && (
                        <Icon
                            name="copy"
                            style={{ paddingLeft: 5 }}
                            onClick={e => this.showHint(true)}
                            onMouseLeave={e => this.hideHint()}
                        />
                    )}
                    <StyledHint>
                        <StyledClicked>
                            <Icon name="check" />
                        </StyledClicked>
                    </StyledHint>
                </StyledContainer>
            );
        };

        return <div>{showCopyLink ? <ContainerWBtn /> : <ContainerWHint />}</div>;
    }
}
