/* Base wrapper compenents to use semantic-ui-react & redux-form components together */
import React from "react";
import { Form as SemanticForm } from "semantic-ui-react";

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
            />
            {touched &&
                ((error && (
                    <span>
                        <i>{error}</i>
                    </span>
                )) ||
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
