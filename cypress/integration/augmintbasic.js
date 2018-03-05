/*
    TODO:
        - split into multiple
*/

describe("Augmint basic e2e", function() {
    const getUserAEurBalance = () => {
        cy
            .get("[data-testid=accountInfoBlock]")
            .should("not.have.class", "loading");
        return cy.get("[data-testid=userAEurBalance]").then(bal => {
            return Number(bal.text());
        });
    };

    const getLoan = (prodId, disbursedAmount, repaymentAmount, ethAmount) => {
        cy.get("[data-testid=getLoanMenuLink]").click();

        cy.get(`[data-testid=selectLoanProduct-${prodId}]`).click();
        cy
            .get("[data-testid=selectedLoanProductBlock]")
            .should("contain", "Selected: loan product " + (prodId + 1));
        // NB: only works with integers, see: https://github.com/cypress-io/cypress/issues/1171
        cy
            .get("[data-testid=loanTokenAmountInput]")
            .type(disbursedAmount.toString())
            .should("have.value", disbursedAmount.toString());
        cy
            .get("[data-testid=repaymentAmountInput]")
            .should("have.value", repaymentAmount.toString());
        cy
            .get("[data-testid=ethAmountInput]")
            .should("have.value", ethAmount.toString());

        return getUserAEurBalance().then(aEurBalanceBefore => {
            const expBal =
                Math.round((aEurBalanceBefore + disbursedAmount) * 10000) /
                10000;
            cy.get("[data-testid=submitBtn]").click();
            cy
                .get("[data-testid=EthSubmissionSuccessPanel]")
                .contains("You've got a loan");
            cy.contains("Disbursed: " + disbursedAmount + " A-EUR");
            cy.contains("To be repaid: " + repaymentAmount + " A-EUR");
            cy.contains("Collateral in escrow: " + ethAmount + " ETH");
            cy
                .get("[data-testid=userAEurBalance]")
                .contains(expBal.toString())
                .then(res => {
                    cy
                        .get("[data-testid=accountInfoBlock]")
                        .should("not.have.class", "loading");
                });
        });
    };

    before(function() {
        cy.visit("/");
        cy.get("[data-testid=useAEurButton]").click();
        cy
            .get("[data-testid=TryItConnectedPanel]")
            .should("contain", "You are connected");
        cy.ganacheTakeSnapshot();
    });

    after(function() {
        cy.ganacheRevertSnapshot();
    });

    it("Under the hood", function() {
        cy.visit("/under-the-hood");

        cy.get("[data-testid=baseInfoLink]").click();
        cy.get("[data-testid=web3ConnectionInfo]").contains("connected");
        cy
            .get("[data-testid=userAccountTokenBalance]")
            .should("not.contain", "?");

        cy.screenshot("underthehood_baseinfo");

        cy.get("[data-testid=augmintInfoLink]").click();
        cy
            .get("[data-testid=MonetarySupervisor-connectionStatus]")
            .should("contain", "connected | not loading");
        cy
            .get("[data-testid=AugmintToken-connectionStatus]")
            .should("contain", "connected | not loading");
        cy.screenshot("underthehood_augmint_baseinfo");

        cy.get("[data-testid=loansInfoLink]").click();
        cy
            .get("[data-testid=LoanManager-connectionStatus]")
            .should("contain", "connected | not loading");
        cy.screenshot("underthehood_loans");
    });

    it("Should display reserves", function() {
        cy.get("[data-testid=reservesMenuLink").click();

        cy.get("[data-testid=totalSupply]").should("not.contain", "?");
        cy
            .get("[data-testid=issuedByMonetaryBoard]")
            .should("not.contain", "?");
        cy
            .get("[data-testid=reserveEthBalanceInFiat]")
            .should("not.contain", "?");
        cy.get("[data-testid=reserveTokenBalance]").should("not.contain", "?");

        cy
            .get("[data-testid=feeAccountTokenBalance]")
            .should("not.contain", "?");
        cy
            .get("[data-testid=interestEarnedAccountTokenBalance]")
            .should("not.contain", "?");

        cy.get("[data-testid=loansToCollectButton]").click();
        cy
            .get("[data-testid=loansToCollectBlock]")
            .should("contain", "No defaulted and uncollected loan.");
    });

    it("Should get and collect a loan", function() {
        //get a loan which defaults in 1 sec
        getLoan(6, 1000, 1010.11, 1.06541)
            .then(res => {
                return getUserAEurBalance();
            })
            .then(aEurBalanceBefore => {
                cy.get("[data-testid=reservesMenuLink").click();
                // // TODO: check reserves
                cy.get("[data-testid=loansToCollectButton]").click();
                cy.get("[data-testid=collectLoanButton]").click();
                cy
                    .get("[data-testid=EthSubmissionSuccessPanel]")
                    .should("contain", "Successful collection of 1 loans");
            });
    });

    it("Should repay a loan", function() {
        // take 2 loans to have enough aEur to repay one of them
        getLoan(0, 200, 250, 0.31313)
            .then(res => {
                return getLoan(0, 200, 250, 0.31313);
            })
            .then(res => {
                return getUserAEurBalance();
            })
            .then(aEurBalanceBefore => {
                const expBal =
                    Math.round((aEurBalanceBefore - 250) * 10000) / 10000;

                cy.contains("this loan's page").click();
                cy.get("[data-testid=repayLoanButton]").click();
                cy.get("[data-testid=confirmRepayButton]").click();

                cy
                    .get("[data-testid=EthSubmissionSuccessPanel]")
                    .should("contain", "Successful repayment");
                cy
                    .get("[data-testid=userAEurBalance]")
                    .should("contain", expBal);

                cy.get("[data-testid=accountInfoBlock]");
                cy.should("not.have.class", "loading");

                cy.get("[data-testid=myAccountMenuLink]").click();
                // TODO loan removed, status etc.
            });
    });

    it("Should transfer A-EUR", function() {
        cy
            .get("[data-testid=myAccountMenuLink]")
            .click()
            .then(() => {
                return getUserAEurBalance();
            })
            .then(aEurBalanceBefore => {
                const amount = 100;
                const fee = 0.2;
                const toAddress = "0x5e09B21cCF42c1c30ca9C1C8D993d922E7c0d036";
                const narrative = "cypress test transfer";
                const expBal =
                    Math.round((aEurBalanceBefore - amount - fee) * 100) / 100; // Js floating <3

                cy
                    .get("[data-testid=transferAmountInput]")
                    .type(amount)
                    .should("have.value", amount.toString());

                cy
                    .get("[data-testid=transferNarrativeField] > input")
                    .type(narrative)
                    .should("have.value", narrative);

                cy.get("[data-testid=transferFeeAmount]").then(feeEl => {
                    assert.equal(feeEl.text(), fee.toString());
                });

                cy
                    .get("[data-testid=transferToAddressField] > input")
                    .type(toAddress)
                    .should("have.value", toAddress);

                cy.get("[data-testid=submitTransferButton]").click();

                cy
                    .get("[data-testid=EthSubmissionSuccessPanel]")
                    .within(() => {
                        cy.contains("Successful transfer");
                        cy.contains(
                            "Sent " +
                                amount +
                                " A-EUR to " +
                                toAddress.toLowerCase()
                        );
                        return cy.get("[data-testid=transactionHash]");
                    })
                    .then(hashEl => {
                        const txHash = hashEl.text();
                        cy
                            .get("[data-testid=userAEurBalance]")
                            .contains(expBal.toString())
                            .then(res => {
                                cy
                                    .get("[data-testid=accountInfoBlock]")
                                    .should("not.have.class", "loading");
                            });
                        cy
                            .get(`[data-testid=transferListItem-${txHash}]`)
                            .within(() => {
                                cy.contains("To: " + toAddress);
                                cy.contains("Amount: -" + amount);
                                cy.contains("Fee: " + fee);
                                cy.contains(narrative);
                            });
                    });
            });
    });

    it("Should buy/sell A-EUR on exchange");

    it("Should lock and release A-EUR");
    it("Should buy A-EUR from reserve");
});
