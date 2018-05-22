import React from "react";
import Icon from "components/augmint-ui/icon";
import { Tooltip, TooltipArrow, TooltipInner } from "styled-tooltip-component";

export default class ToolTip extends React.Component {
    constructor(props) {
        super();
        this.state = {
            top: 0,
            left: 0,
            hidden: true
        };
    }

    handleTooltip(ev, hidden) {
        // Hack start
        let tooltip = ev.target.parentElement.querySelector("#tooltip");
        if (hidden) {
            tooltip.style.visibility = "hidden";
        } else {
            tooltip.style.visibility = "visible";
        }
        // Hack end
        this.setState({
            top: ev.target.offsetTop + 5,
            left: ev.target.offsetLeft + ev.target.offsetWidth,
            hidden
        });
    }

    render() {
        const { top, left, hidden } = this.state;
        const { children, header, icon, ...other } = this.props;
        return (
            <div>
                <Icon
                    color="grey"
                    name={icon ? icon : "help circle"}
                    onMouseEnter={ev => this.handleTooltip(ev, false)}
                    onMouseLeave={ev => this.handleTooltip(ev, true)}
                />
                <Tooltip
                    id="tooltip"
                    hidden={hidden}
                    style={{
                        top: `${top}px`,
                        left: `${left}px`
                    }}
                    right
                >
                    <TooltipArrow right />
                    <TooltipInner right {...other}>
                        {header} {children}
                    </TooltipInner>
                </Tooltip>
            </div>
        );
    }
}

export function MoreInfoTip(props) {
    const { ...other } = props;
    return <ToolTip icon="zoom" {...other} />;
}
