import React from "react";

export default function RadioInput(props) {
    const { type = "radio", val, ...other } = props;
    return <input type={type} value={val} name={props.input.name} onChange={props.input.onChange} {...other} />;
}
