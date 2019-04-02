import React from "react";
import { Link } from "react-router-dom";
import BigNumber from "bignumber.js";
import { getTransferFee, getMaxTransfer } from "modules/ethereum/transferTransactions";
import store from "modules/store";
import { StyleLabel } from "components/augmint-ui/FormCustomLabel/styles";
import {
    StyledContainer,
    StyledInput,
    StyledSelect,
    StyledLabel,
    StyledFormField,
    StyledError
} from "components/augmint-ui/baseComponents/styles";

export const Validations = {
    required: value => {
        return value || (value && value.toString().trim() === "") ? undefined : "Required";
    },
    email: value =>
        value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? "Invalid email address" : undefined,

    tokenAmount: value => {
        return parseFloat(value) > 0 ? undefined : "Amount must be bigger than 0";
    },

    ethAmount: value => (parseFloat(value) > 0 ? undefined : "Amount must be bigger than 0"),

    price: value => (parseFloat(value) > 0 ? undefined : "Price must be bigger than 0"),

    address: value => {
        let web3 = store.getState().web3Connect.web3Instance;
        //TODO: different error when checksum error
        return web3.utils.isAddress(value) ? undefined : "Invalid address";
    },

    userTokenBalance: value => {
        let userBalance = store.getState().userBalances.account.tokenBalance;
        return userBalance < parseFloat(value) ? "Your A-EUR balance is less than the amount" : undefined;
    },

    userTokenBalanceWithTransferFee: value => {
        const userBalance = store.getState().userBalances.account.tokenBalance;
        let amount;
        try {
            amount = parseFloat(value);
        } catch (error) {
            return;
        }
        const fee = getTransferFee(amount);
        if (userBalance >= amount + fee) {
            return undefined;
        }
        const maxTransfer = getMaxTransfer(userBalance);

        return (
            <span>
                Your A-EUR balance is less than the amount + transfer fee.
                {maxTransfer > 0 && ` Max amount you can transfer is ${maxTransfer} A-EUR`}
                <br />
                <Link to="/how-to-get">See, how to get more A-EUR »</Link>
            </span>
        );
    },

    minOrderTokenAmount: value => {
        const minValue = 1;
        let amount;
        try {
            amount = new BigNumber(value);
        } catch (error) {
            return;
        }

        if (amount.gte(minValue)) {
            return undefined;
        } else {
            return `Token amount is less than minimum order amount of ${minValue} A-EUR`;
        }
    },

    ethUserBalance: value => {
        const userBalance = store.getState().userBalances.account.ethBalance;
        return userBalance < parseFloat(value) ? "Your ETH balance is less than the amount" : undefined;
    },

    notOwnAddress: value => {
        let userAccount = store.getState().web3Connect.userAccount;
        return value.toLowerCase() === userAccount.toLowerCase() ? "You can't transfer to yourself" : undefined;
    },

    minTokenAmount: minValue => value => {
        return parseFloat(value) < minValue ? `Amount must be at least ${minValue} A-EUR` : undefined;
    },

    maxLoanAmount: maxValue => value => {
        return parseFloat(value) > maxValue
            ? `Loan amount is greater than currently available maximum of ${maxValue} A-EUR`
            : undefined;
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
    },

    sixDecimals: (value, previousValue) => {
        return normalizeDecimals(6, value);
    },

    eightDecimals: (value, previousValue) => {
        return normalizeDecimals(8, value);
    }
};

export function Select(props) {
    function addOptionsToSelect(options) {
        let result = [];
        options.forEach((product, i) => {
            result.push(
                <option key={product.id} value={product.id} id={"selectLoanProduct-" + product.id}>
                    {product.termText}
                </option>
            );
        });
        return result;
    }

    return (
        <StyledSelect {...props} placeholder={props.placeholder}>
            {addOptionsToSelect(props.options)}
        </StyledSelect>
    );
}

export const formField = ({
    children,
    input,
    type,
    label,
    labelAlignLeft,
    labelAlignRight,
    oneLine,
    placeholder,
    info,
    isSelect,
    selectOptions,
    meta: { touched, error, warning },
    ...props
}) => {
    return (
        <StyledFormField className={touched && error ? "error" : ""}>
            {children}
            {label && <StyledLabel>{label}</StyledLabel>}
            <StyledContainer className={oneLine ? "oneLine" : ""}>
                {labelAlignLeft && <StyleLabel align="left">{labelAlignLeft}</StyleLabel>}
                {!isSelect && (
                    <StyledInput
                        {...props}
                        value={input.value}
                        {...input}
                        type={type}
                        placeholder={placeholder}
                        error={touched && error ? "true" : "false"}
                    />
                )}
                {labelAlignRight && !isSelect && <StyleLabel align="right">{labelAlignRight}</StyleLabel>}

                {isSelect && (
                    <Select
                        {...input}
                        {...props}
                        value={input.value}
                        options={selectOptions}
                        placeholder={placeholder}
                    />
                )}
            </StyledContainer>
            {info && <div style={{ fontSize: "12px", color: "gray", display: "block" }}>{info}</div>}

            {touched &&
                ((error && <StyledError>{error}</StyledError>) ||
                    (warning && (
                        <span>
                            <i>{warning}</i>
                        </span>
                    )))}
        </StyledFormField>
    );
};

export const Form = ({ ...other }) => {
    return <form {...other} />;
};

Form.Field = formField;
