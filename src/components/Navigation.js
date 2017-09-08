import React from "react";
import { NavLink } from "react-router-dom";

export class PnavLink extends React.Component {
    render() {
        const { target, children, ...other } = this.props;

        return (
            <NavLink target={target} {...other}>
                {children}
            </NavLink>
        );
    }
}

NavLink.defaultProps = {
    target: "_self"
};
