import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import BigNumber from "bignumber.js";
import augmintTokenProvider from "modules/augmintTokenProvider";
import ratesProvider from "modules/ratesProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import lockManagerProvider from "modules/lockManagerProvider";
import metricsProvider from "modules/metricsProvider";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { Pheader } from "components/PageLayout";
import { ReserveStats } from "./components/ReserveStats";
import { TotalSupply } from "./components/TotalSupply";
import { LtdStats } from "./components/LtdStats";
import { EarningStats } from "./components/EarningStats";
import { EthereumState } from "containers/app/EthereumState";
import Button from "components/augmint-ui/button";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import { MyListGroup, MyGridTable } from "components/MyListGroups";

import { StyledContainer, StyledHeader, StyledPheader, StyledMyListGroup, StyledRow, StyledCol } from "./styles";

class AugmintToken extends React.Component {
    componentDidMount() {
        connectWeb3();
        ratesProvider();
        augmintTokenProvider();
        loanManagerProvider();
        lockManagerProvider();
        metricsProvider();
    }

    handleAugmintTokenRefreshClick = e => {
        e.preventDefault();
        this.props.refreshAugmintToken();
    };

    render() {
        let loansCollected = "?",
            amountOwnedByUsers = "?",
            amountOwnedByUsersLiquid = "?",
            loanCollateralCoverageRatio = "?",
            collateralInEscrow = "?",
            availableForMarketIntervention = "?",
            bn_collateralInEscrowEth = 1,
            bn_outstandingLoansAmount = 1;

        if (Object.keys(this.props.metrics.loansData).length) {
            loansCollected = new BigNumber(this.props.metrics.loansData.collectedLoansAmount.toFixed(15))
                .plus(this.props.metrics.loansData.defaultedLoansAmount)
                .toNumber();
        }

        if (
            this.props.augmintToken.info.totalSupply !== "?" &&
            this.props.monetarySupervisor.info.reserveTokenBalance !== "?" &&
            this.props.augmintToken.info.feeAccountTokenBalance !== "?" &&
            this.props.monetarySupervisor.info.interestEarnedAccountTokenBalance !== "?"
        ) {
            const bn_amountOwnedByUsers = new BigNumber(this.props.augmintToken.info.totalSupply.toFixed(15))
                .minus(this.props.monetarySupervisor.info.reserveTokenBalance)
                .minus(this.props.augmintToken.info.feeAccountTokenBalance)
                .minus(this.props.monetarySupervisor.info.interestEarnedAccountTokenBalance);

            amountOwnedByUsers = bn_amountOwnedByUsers.toNumber();
            amountOwnedByUsersLiquid = bn_amountOwnedByUsers
                .minus(this.props.monetarySupervisor.info.totalLockedAmount)
                .toNumber();
        }

        if (
            this.props.metrics.loansData.collateralInEscrowEth &&
            this.props.metrics.loansData.outstandingLoansAmount &&
            this.props.rates.info.bn_ethFiatRate
        ) {
            bn_collateralInEscrowEth = new BigNumber(this.props.metrics.loansData.collateralInEscrowEth.toFixed(15));
            bn_outstandingLoansAmount = new BigNumber(this.props.metrics.loansData.outstandingLoansAmount.toFixed(15));
            let bn_collateralInEscrow = this.props.rates.info.bn_ethFiatRate.mul(bn_collateralInEscrowEth);
            collateralInEscrow = bn_collateralInEscrow.toFixed(2);

            loanCollateralCoverageRatio = bn_collateralInEscrow
                .div(bn_outstandingLoansAmount)
                .mul(100)
                .toFixed(2);
        }

        if (
            this.props.monetarySupervisor.info.reserveEthBalance !== "?" &&
            this.props.augmintToken.info.feeAccountEthBalance !== "?"
        ) {
            availableForMarketIntervention = new BigNumber(
                this.props.monetarySupervisor.info.reserveEthBalance.toFixed(15)
            )
                .plus(this.props.augmintToken.info.feeAccountEthBalance)
                .toNumber();
        }
        let loanLimit = 0;
        const loanProductsList =
            this.props.loanManager &&
            this.props.loanManager.products &&
            this.props.loanManager.products.map((product, index) => {
                if (index === 0) {
                    loanLimit = product.maxLoanAmount;
                }
                if (product.maxLoanAmount < loanLimit) {
                    loanLimit = product.maxLoanAmount;
                }
                return (
                    <div>
                        {product.isActive && (
                            <h1 key={"reserv-page-loan-" + index}>
                                Loan: {" " + product.termText + " " + (product.interestRatePa * 100).toFixed(2)}
                            </h1>
                        )}
                    </div>
                );
            });
        let lockLimit = 0;
        const lockProductsList =
            this.props.lockManager &&
            this.props.lockManager.products &&
            this.props.lockManager.products.map((product, index) => {
                if (index === 0) {
                    lockLimit = product.maxLockAmount;
                }
                if (product.maxLockAmount < loanLimit) {
                    lockLimit = product.maxLockAmount;
                }
                return (
                    <div>
                        {product.isActive && (
                            <h1 key={"reserv-page-lock-" + index}>
                                Lock: {" " + product.durationText + " " + (product.interestRatePa * 100).toFixed(2)}
                            </h1>
                        )}
                    </div>
                );
            });
        return (
            <EthereumState>
                <StyledContainer>
                    <TopNavTitlePortal>
                        <Pheader className="secondaryColor" header="Reserves" />
                    </TopNavTitlePortal>
                    <StyledPheader header="Stability Dashboard" className="stabilityDashboard" style={{ margin: 0 }} />
                    <StyledHeader as="h3" content="A-EUR Market Supply" />
                    <StyledMyListGroup>
                        <StyledRow>
                            <StyledCol width={3 / 5}>
                                <MyListGroup>
                                    <StyledRow halign="justify">
                                        <StyledCol>+ Loans Outstanding:</StyledCol>
                                        <StyledCol>
                                            {this.props.metrics.loansData.outstandingLoansAmount + " A€"}
                                        </StyledCol>
                                    </StyledRow>
                                </MyListGroup>
                            </StyledCol>
                            <StyledCol width={2 / 5} />
                        </StyledRow>
                        <StyledRow>
                            <StyledCol width={3 / 5}>
                                <MyListGroup>
                                    <StyledRow halign="justify">
                                        <StyledCol>+ Loans Collected:</StyledCol>
                                        <StyledCol>{loansCollected + " A€"}</StyledCol>
                                    </StyledRow>
                                </MyListGroup>
                            </StyledCol>
                            <StyledCol width={2 / 5} />
                        </StyledRow>
                    </StyledMyListGroup>
                </StyledContainer>
                <div style={{ color: "black" }}>
                    <h1>
                        Issued by Stability Board (Net): {this.props.monetarySupervisor.info.issuedByStabilityBoard}
                    </h1>
                    <h1>Total Supply: {this.props.augmintToken.info.totalSupply}</h1>
                    <br />
                    <h1>
                        Market Intervention Reserve (reserveTokenBalance):{" "}
                        {this.props.monetarySupervisor.info.reserveTokenBalance}
                    </h1>
                    <h1>FEES:{this.props.augmintToken.info.feeAccountTokenBalance}</h1>
                    <h1>
                        Earned Interest (interestEarnedAccountTokenBalance):{" "}
                        {this.props.monetarySupervisor.info.interestEarnedAccountTokenBalance}
                    </h1>
                    <h1>Amount Owned by Users: {amountOwnedByUsers}</h1>
                    <br />
                    <h1>
                        Locked in Aamount (totalLockedAmount): {this.props.monetarySupervisor.info.totalLockedAmount}
                    </h1>
                    <h1>Amount Owned by Users (Liquid): {amountOwnedByUsersLiquid}</h1>
                    <br />
                    <br />
                    <h1>Loan Collateral Coverage Ratio: {loanCollateralCoverageRatio + " %"}</h1>
                    <h1>Loans Outstanding: {this.props.metrics.loansData.outstandingLoansAmount}</h1>

                    <h1>
                        Collateral in escrow (metrics):{this.props.metrics.loansData.collateralInEscrowEth + " ETH, "}
                        {collateralInEscrow + " A-EUR"}
                    </h1>
                    <h1>??? Collateral in escrow ??? :{this.props.loanManager.info.ethBalance}</h1>
                    <br />
                    <br />
                    <br />
                    <h1>
                        ETH Market Intervention Reserve (monetarySupervisor->reserveEthBalance):{
                            this.props.monetarySupervisor.info.reserveEthBalance
                        }
                    </h1>
                    <h1>
                        ETH Fees (augmintToken->feeAccountEthBalance):{" "}
                        {this.props.augmintToken.info.feeAccountEthBalance}
                    </h1>
                    <h1>Available for Market Intervention: {availableForMarketIntervention}</h1>
                    <br />
                    <br />
                    <h1>LOANS</h1>
                    <h1>Active Loans: {this.props.monetarySupervisor.info.totalLoanAmount}</h1>
                    <h1>Loan To Lockin Ratio: {this.props.monetarySupervisor.info.ltdPercent}</h1>
                    <h1>Current Loan Limit: {loanLimit}</h1>
                    {loanProductsList}
                    <br />
                    <br />
                    <h1>LOCK</h1>
                    <h1>Active Lockins: {this.props.monetarySupervisor.info.totalLockedAmount}</h1>
                    <h1>Loan To Lockin Ratio: {this.props.monetarySupervisor.info.ltdPercent}</h1>
                    <h1>Current Lockin Limit: {lockLimit}</h1>
                    {lockProductsList}
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                </div>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    augmintToken: state.augmintToken,
    loanManager: state.loanManager,
    lockManager: state.lockManager,
    monetarySupervisor: state.monetarySupervisor,
    metrics: state.metrics,
    rates: state.rates
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            refreshAugmintToken
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AugmintToken);
