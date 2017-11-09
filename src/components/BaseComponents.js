/* Base wrapper compenents to use semantic-ui-react & redux-form components together */
import React from "react";
import { Form as SemanticForm } from "semantic-ui-react";
import store from "modules/store";

export const Validations = {
    required: value => {
        return value || (value && value.toString().trim() === "")
            ? undefined
            : "Required";
    },
    email: value =>
        value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
            ? "Invalid email address"
            : undefined,

    ucdAmount: value => {
        return parseFloat(value) > 0
            ? undefined
            : "Amount must be bigger than 0";
    },

    ethAmount: value =>
        parseFloat(value) > 0 ? undefined : "Amount must be bigger than 0",

    address: value => {
        let web3 = store.getState().web3Connect.web3Instance;
        //TODO: different error when checksum error
        return web3.utils.isAddress(value) ? undefined : "Invalid address";
    },

    ucdUserBalance: value => {
        // TODO: shall we look for bn_ucdPendingBalance instead?
        let userBalance = store.getState().userBalances.account.bn_ucdBalance;
        return userBalance.lt(parseFloat(value))
            ? "Your ACD balance is less than the amount"
            : undefined;
    },

    ethUserBalance: value => {
        // TODO: shall we look for bn_ucdPendingBalance instead?
        let userBalance = store.getState().userBalances.account.bn_ethBalance;
        return userBalance.lt(parseFloat(value))
            ? "Your ETH balance is less than the amount"
            : undefined;
    },

    notOwnAddress: value => {
        let userAccount = store.getState().web3Connect.userAccount;
        return value.toLowerCase() === userAccount.toLowerCase()
            ? "You can't transfer to yourself"
            : undefined;
    },

    minUcdAmount: minValue => value => {
        return parseFloat(value) < minValue
            ? "Amount must be at least " + minValue + " ACD"
            : undefined;
    }
};

export const Parsers = {
    trim: value => value && value.trim()
};
export const Normalizations = {
    ucdAmount: (value, previousValue) => {
        if (value === null || value === "" || value === undefined) {
            return "";
        }
        let v = value.toString().replace(/[^\d.]/g, "");
        v = v.slice(0, v.indexOf(".") >= 0 ? v.indexOf(".") + 3 : undefined);
        return v;
    },

    ethAmount: (value, previousValue) => {
        if (value === null || value === "" || value === undefined) {
            return "";
        }
        // FIXME: interantilaistion (for different thousand separators)
        let v = value.toString().replace(/[^\d.]/g, "");
        let firstDot = v.indexOf(".");
        // not yet working fix attempt for edge case when user entering a second dot.
        //  it requires text type input field
        // if (firstDot >= 0) {
        //     let secondDot = v.indexOf(".", firstDot + 1);
        //     console.log("v:", v,  "firstdot: ", firstDot, "seconddot: ",secondDot)
        //     if (secondDot >= 0) {
        //         v = v.slice(0, secondDot );
        //     }
        // }
        v = v.slice(0, firstDot >= 0 ? firstDot + 6 : undefined);
        return v;
    }
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
