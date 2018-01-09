/* Base wrapper compenents to use semantic-ui-react & redux-form components together */
import React from "react";
import BigNumber from "bignumber.js";
import { getTransferFee, getMaxTransfer } from "modules/ethereum/transferTransactions";
import { Form as SemanticForm } from "semantic-ui-react";
import store from "modules/store";

export const Validations = {
    required: value => {
        return value || (value && value.toString().trim() === "") ? undefined : "Required";
    },
    email: value =>
        value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? "Invalid email address" : undefined,

    ucdAmount: value => {
        return parseFloat(value) > 0 ? undefined : "Amount must be bigger than 0";
    },

    ethAmount: value => (parseFloat(value) > 0 ? undefined : "Amount must be bigger than 0"),

    address: value => {
        let web3 = store.getState().web3Connect.web3Instance;
        //TODO: different error when checksum error
        return web3.utils.isAddress(value) ? undefined : "Invalid address";
    },

    ucdUserBalance: value => {
        // TODO: shall we look for bn_ucdPendingBalance instead?
        let userBalance = store.getState().userBalances.account.bn_ucdBalance;
        return userBalance.lt(parseFloat(value)) ? "Your ACE balance is less than the amount" : undefined;
    },

    acdUserBalanceWithTransferFee: value => {
        // TODO: shall we look for bn_ucdPendingBalance instead?
        let decimalsDiv = store.getState().tokenUcd.info.bn_decimalsDiv;
        let userBalance = store.getState().userBalances.account.bn_ucdBalance.mul(decimalsDiv);
        let amount;
        try {
            amount = new BigNumber(value).mul(decimalsDiv);
        } catch (error) {
            return;
        }
        let fee = getTransferFee(amount);
        if (userBalance.gte(amount.add(fee))) {
            return undefined;
        }
        let maxTransfer = getMaxTransfer(userBalance)
            .div(decimalsDiv)
            .toString();
        if (maxTransfer <= 0) {
            return "Your ACE balance is less than the amount + transfer fee.";
        }
        return (
            "Your ACE balance is less than the amount + transfer fee. Max amount you can transfer is " +
            maxTransfer +
            " ACE"
        );
    },

    ethUserBalance: value => {
        // TODO: shall we look for bn_ucdPendingBalance instead?
        let userBalance = store.getState().userBalances.account.bn_ethBalance;
        return userBalance.lt(parseFloat(value)) ? "Your ETH balance is less than the amount" : undefined;
    },

    notOwnAddress: value => {
        let userAccount = store.getState().web3Connect.userAccount;
        return value.toLowerCase() === userAccount.toLowerCase() ? "You can't transfer to yourself" : undefined;
    },

    minUcdAmount: minValue => value => {
        return parseFloat(value) < minValue ? "Amount must be at least " + minValue + " ACE" : undefined;
    }
};

export const Parsers = {
    trim: value => value && value.trim()
};
function normalizeDecimals(decimalPlaces, value) {
    if (value === null || value === "" || value === undefined) {
        return "";
    }
    // TODO: interantilaistion (for different thousand separators)
    let v = value.toString().replace(/[^\d.]/g, "");
    let firstDot = v.indexOf(".");
    // TODO: not yet working fix attempt for edge case when user entering a second dot.
    // if (firstDot >= 0) {
    //     let secondDot = v.indexOf(".", firstDot + 1);
    //     console.log("v:", v,  "firstdot: ", firstDot, "seconddot: ",secondDot)
    //     if (secondDot >= 0) {
    //         v = v.slice(0, secondDot );
    //     }
    // }
    v = v.slice(0, firstDot >= 0 ? firstDot + decimalPlaces + 1 : undefined);
    return v;
}
export const Normalizations = {
    fourDecimals: (value, previousValue) => {
        return normalizeDecimals(4, value);
    },

    twoDecimals: (value, previousValue) => {
        return normalizeDecimals(2, value);
    },

    fiveDecimals: (value, previousValue) => {
        return normalizeDecimals(5, value);
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
