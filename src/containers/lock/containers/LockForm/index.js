import React from "react";

import store from "modules/store";
import { connect } from "react-redux";
import moment from "moment";

import { newLock, LOCKTRANSACTIONS_NEWLOCK_CREATED } from "modules/reducers/lockTransactions";

import { reduxForm, Field, SubmissionError, formValueSelector } from "redux-form";

import { Pblock } from "components/PageLayout";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Form, Validations } from "components/BaseComponents";
import Button from "components/augmint-ui/button";
import { AEUR } from "components/augmint-ui/currencies.js";

import styled from "styled-components";
import theme from "styles/theme";

const StyledBox = styled.div`
    border-radius: 3px;
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    background: rgba(232, 232, 232, 0.3);

    text-align: center;
    font-size: 14px;
    line-height: 200%;
    color: rgba(0, 0, 0, 0.7);

    & .box-val {
        display: block;
        color: black;
        font-size: 22px;
        font-weight: 800;
        margin-bottom: -4px;
        & .symbol {
            font-size: 14px;
            font-weight: 400;
        }
    }
`;

class LockContainer extends React.Component {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.lockAmountValidation = this.lockAmountValidation.bind(this);
        this.defaultProductId = this.defaultProductId.bind(this);
        this.lockTermChange = this.lockTermChange.bind(this);
        this.lockAmountChange = this.lockAmountChange.bind(this);
        this.reset = this.props.reset;

        this.state = {
            initialized: false,
            activeProducts: [],
            defaultId: null,
            selectedProductId: null,
            selectedProduct: null,
            lockAmount: null,
            result: null
        };
    }

    componentDidUpdate(prevProps, props) {
        if (this.props.lockProducts && this.props.lockProducts.length && !this.state.initialized) {
            this.initForm();
        }
    }

    resetAndInitForm() {
        this.reset();
        this.initForm();
    }

    initForm() {
        const activeProducts = this.filterActiveProducts();
        const defaultId = this.defaultProductId();
        const selectedProduct = activeProducts.find(product => product.id === defaultId);
        // const initAmount = 100;

        // this.props.initialize({
        //     lockAmount: initAmount,
        //     lockTerms: defaultId
        // });

        this.setState({
            initialized: true,
            // lockAmount: initAmount,
            selectedProductId: defaultId,
            selectedProduct: selectedProduct
        });
    }

    filterActiveProducts() {
        const activeProducts = this.props.lockProducts
            .filter(product => product.isActive)
            .sort((p1, p2) => p2.durationInSecs - p1.durationInSecs)
            .map(product => {
                const end = moment()
                    .add(product.durationInDays, "days")
                    .format("D MMM YYYY");
                product.unlockByDatestring = end;
                return product;
            });

        this.setState({
            activeProducts: activeProducts
        });
        return activeProducts;
    }

    defaultProductId() {
        let productId = this.state.defaultId;

        if (!productId) {
            if (this.state.activeProducts && this.state.activeProducts.length) {
                productId = this.state.activeProducts[0].id;
            } else {
                productId = this.filterActiveProducts()[0].id;
            }
            this.setState({
                defaultId: productId
            });
        }
        return productId;
    }

    earnAmount() {
        let result = 0;
        let amount = this.state.lockAmount;
        let product = this.state.selectedProduct;
        if (product && amount) {
            result = Math.ceil(amount * product.perTermInterest * 100) / 100;
        }
        return result;
    }

    lockTermChange(e) {
        let id = parseInt(e.target.value);
        const selectedProduct = this.state.activeProducts.find(product => product.id === id);

        this.setState({
            selectedProductId: id,
            selectedProduct: selectedProduct
        });
    }

    lockAmountChange(e) {
        this.setState({
            lockAmount: e.target.value || 0
        });
    }

    // todo refact
    lockAmountValidation(value, allValues) {
        const productId = allValues.productId || this.defaultProductId();
        const minValue = this.props.lockProducts[productId].minimumLockAmount;
        const maxValue = this.props.lockProducts[productId].maxLockAmount;
        const val = parseFloat(value);

        if (val < minValue) {
            return `Minimum lockable amount is ${minValue} A-EUR for selected lock term`;
        } else if (val > maxValue) {
            return `Currently maximum ${maxValue} A-EUR is available for lock with selected lock term`;
        } else {
            return undefined;
        }
    }

    async onSubmit(values) {
        let amount,
            productId = this.state.selectedProductId ? this.state.selectedProductId : this.state.defaultId;
        try {
            amount = parseFloat(values.lockAmount);
        } catch (error) {
            throw new SubmissionError({
                _error: {
                    title: "Invalid amount",
                    details: error
                }
            });
        }

        const res = await store.dispatch(newLock(productId, amount));
        if (res.type !== LOCKTRANSACTIONS_NEWLOCK_CREATED) {
            console.error(res);
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result
            });
            return res;
        }
    }

    render() {
        const { lockManager } = this.props;
        const { error, handleSubmit, pristine, submitting, submitSucceeded, clearSubmitErrors } = this.props;
        let earnAmount = 0;
        let interest = "";
        let unlockBy = "...";

        if (
            this.state.lockAmount &&
            typeof this.state.selectedProductId === "number" &&
            this.state.activeProducts.length
        ) {
            earnAmount = this.earnAmount();
        }
        if (this.state.selectedProduct) {
            interest = this.state.selectedProduct.interestRatePaPt;
            unlockBy = this.state.selectedProduct.unlockByDatestring;
        }

        return (
            <Pblock id="lock-form" noMargin={true} loading={lockManager.isLoading && !this.state.initialize}>
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="New Lock submitted"
                        result={this.state.result}
                        onDismiss={() => this.resetAndInitForm()}
                    />
                )}

                {!submitSucceeded && (
                    <Form error={error ? "true" : "false"} onSubmit={handleSubmit(this.onSubmit)}>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Create loan failed"
                                onDismiss={() => clearSubmitErrors()}
                            />
                        )}

                        <StyledBox>
                            Lock A-EUR at
                            <div className="box-val">
                                {`${interest}% `}
                                <span className="symbol">per year (APR)</span>
                            </div>
                        </StyledBox>

                        <label>How much would you like to lock?</label>
                        <Field
                            name="lockAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            inputmode="numeric"
                            step="any"
                            min="0"
                            ref={input => {
                                this.input = input;
                            }}
                            onChange={this.lockAmountChange}
                            disabled={submitting || !lockManager.isLoaded}
                            validate={[
                                Validations.required,
                                Validations.tokenAmount,
                                this.lockAmountValidation,
                                Validations.userTokenBalance
                            ]}
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                            data-testid="lockAmountInput"
                            autoFocus={true}
                        />

                        <Field
                            component={Form.Field}
                            disabled={submitting || !lockManager.isLoaded}
                            onChange={this.lockTermChange}
                            className="field-big"
                            isSelect="true"
                            selectTestId="lock-product"
                            selectOptions={this.state.activeProducts || []}
                            id="selectedLockProduct"
                            name="lockTerms"
                            data-testid="lock-product-selector"
                        />

                        {!!this.state.lockAmount && (
                            <div>
                                <p style={{ marginTop: 0, marginBottom: 10, lineHeight: 1.5, textAlign: "center" }}>
                                    {"On "}
                                    <strong>{unlockBy}</strong>
                                    {" you get back"}
                                    <br />
                                    <strong>
                                        <AEUR amount={earnAmount + parseFloat(this.state.lockAmount)} />
                                    </strong>
                                    {", earning "}
                                    <strong>
                                        <AEUR amount={earnAmount} />
                                    </strong>
                                    {"."}
                                </p>
                                <p
                                    style={{
                                        color: theme.colors.darkRed,
                                        fontWeight: "bold",
                                        fontSize: 14,
                                        margin: "20px auto 20px auto",
                                        textAlign: "center",
                                        lineHeight: "120%"
                                    }}
                                >
                                    Note: amount cannot be unlocked before <br /> {unlockBy}.
                                </p>
                            </div>
                        )}

                        <Button
                            size="big"
                            disabled={pristine && !this.state.initialized}
                            loading={submitting}
                            data-testid="submitButton"
                            type="submit"
                            style={{
                                height: "50px",
                                padding: "10px 55px",
                                width: "100%",
                                maxWidth: "500px"
                            }}
                        >
                            {submitting ? "Submitting..." : "Lock"}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("LockForm");

LockContainer = connect(state => selector(state, "productId", "lockAmount"))(LockContainer);

export default reduxForm({
    form: "LockForm",
    touchOnBlur: false
})(LockContainer);
