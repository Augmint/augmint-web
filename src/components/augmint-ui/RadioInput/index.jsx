import React from "react";

import { StyledContainer } from "./styles";

export default function RadioInput(props) {
    const { type = "radio", val, isButtonStyle, label, id, ...other } = props;
    let element = <input type={type} value={val} name={props.input.name} onChange={props.input.onChange} {...other} />;
    if (isButtonStyle) {
        element = (
            <StyledContainer>
                <input
                    id={id}
                    type={type}
                    value={val}
                    name={props.input.name}
                    onChange={props.input.onChange}
                    {...other}
                />
                <label for={id}>
                    <div>{label}</div>
                </label>
            </StyledContainer>
        );
    }
    return element;
}
