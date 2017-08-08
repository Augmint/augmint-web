/* compenent to use bootstrap-react FormControl
    & redux-form Field components together
usage:
   <Field name="fieldname" component={FieldInput} type="number" onChange={this.onFieldChange}  />
    */
import React from "react";
import { FormControl } from "react-bootstrap";

export const FieldInput = ({ input, meta, type, placeholder, min, max }) => {
    return (
        <FormControl
            id={input.name}
            type={type}
            placeholder={placeholder}
            min={min}
            max={max}
            value={input.value}
            onChange={input.onChange}
        />
    );
};
