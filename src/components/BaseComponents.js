/* Base wrapper compenents to use bootstrap-react components
    & redux-form components together */
import React from "react";
import { FormControl } from "react-bootstrap";
import { Form as BoostrapForm } from "react-bootstrap";

/*
FieldInput component, usage:
    <Field name="fieldname" component={FieldInput} type="number" onChange={this.onFieldChange}  />
*/
export const FieldInput = ({ input, ...other }) => {
    return (
        <FormControl
            id={input.name}
            value={input.value}
            onChange={input.onChange}
            {...other}
        />
    );
};

/*
 Form Component
 Just pure pass through at the moment
*/
export const Form = ({ ...other }) => {
    return <BoostrapForm {...other} />;
};
