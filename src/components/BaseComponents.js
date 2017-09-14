/* Base wrapper compenents to use semantic-ui-react & redux-form components together */
import React from "react";
import { Form as SemanticForm } from "semantic-ui-react";

export const Validations = {
    required: value => (value ? undefined : "Required"),
    email: value =>
        value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
            ? "Invalid email address"
            : undefined
};

export const Normalizations = {
    trim: value => value && value.trim()
};

export const semanticFormField = ({
    input,
    type,
    label,
    placeholder,
    meta: { touched, error, warning },
    as: As = SemanticForm.Input,
    ...props
}) => {
    return (
        <SemanticForm.Field>
            <As
                {...props}
                {...input}
                value={input.value}
                type={type}
                label={label}
                placeholder={placeholder}
                error={touched && error ? true : false}
            />
            {touched &&
                ((error && <span style={{ color: "red" }}>{error}</span>) ||
                    (warning && (
                        <span>
                            <i>{warning}</i>
                        </span>
                    )))}
        </SemanticForm.Field>
    );
};

export const Form = ({ size = "large", ...other }) => {
    return <SemanticForm size={size} {...other} />;
};

Form.Field = semanticFormField;
