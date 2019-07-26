describe("Loans", function() {
    const getLoan = (prodId, disbursedAmount, repaymentAmount, ethAmount, loanManagerAddress) => {
        const marginLoanSelector = `loan-product_${prodId.toString()}_${loanManagerAddress}`;
        const marginLoanValue = `${prodId.toString()}_${loanManagerAddress}`;

        cy.get("[data-testid=loanMenuLink]").click();
        cy.get("[data-testid=newLoanLink]").click();

        cy.get("[data-testid=loanTokenAmountInput]")
            .clear()
            .type(disbursedAmount.toString())
            .should("have.value", disbursedAmount.toString());
        cy.get(`[data-testid=loan-product-selector]`)
            .select(marginLoanValue, { force: true })
            .should("have.value", marginLoanValue);
        cy.get("[data-testid=repaymentAmount]").should("contain", repaymentAmount.toString());
        cy.get("[data-testid=ethAmount]").should("contain", ethAmount.toString());

        cy.get("[data-testid=submitBtn]").click();
        cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("New loan submitted");

        return cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .first()
            .click()
            .within(() => {
                cy.contains("New loan");
                // TODO : little differences between amounts caused by rounding and decimals
                // cy.contains("Disbursed: " + disbursedAmount + " A-EUR");
                // cy.contains("To be repaid: " + repaymentAmount + " A-EUR");
                cy.contains("Collateral in escrow: " + ethAmount + " ETH");
            });
    };

    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    it("Should get and collect a margin loan", function() {
        //get a loan which defaults in 1 sec
        const loanManagerAddress = "0x213135c85437C23bC529A2eE9c2980646c332fCB";
        getLoan(8, 50, 50.05, 0.05567, loanManagerAddress).then(res => {
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]")
                .first()
                .click({
                    force: true
                });

            // TODO : little differences between amounts caused by rounding and decimals
            // cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 50);
            cy.get("[data-testid=reservesMenuLink").click();
            // // TODO: check reserves
            cy.get("[data-testid=loansToCollectButton]").click();
            cy.get("[data-testid=collectLoanButton]").click();

            //            cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Collect loan(s) submitted");
            //            cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();

            cy.get("[data-testid=EthConfirmationReceivedPanel]").should("contain", "confirmation");
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]").click();

            cy.get("[data-testid=loansToCollectBlock]", { timeout: 8000 }).should(
                "contain",
                "No defaulted and uncollected loan."
            );
        });
    });

    it("Should repay a margin loan", function() {
        const loanManagerAddress = "0x213135c85437C23bC529A2eE9c2980646c332fCB";
        getLoan(7, 50, 50.05, 0.06169, loanManagerAddress).then(() => {
            // TODO : little differences between amounts caused by rounding and decimals
            // cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 51);

            cy.contains("this loan's page")
                .click({ force: true })
                .then(() => {
                    cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]")
                        .first()
                        .click();
                });

            cy.get("[data-testid=repayLoanButton]").click();
            cy.get("[data-testid=confirmRepayButton]").click();

            cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Repayment submitted");

            cy.get("[data-testid=EthConfirmationReceivedPanel]").should("contain", "confirmation");
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]").click();

            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance - 0.05); // interest

            // TODO loan removed, status etc.
            //cy.get("[data-testid=myAccountMenuLink]").click();
        });
    });

    // it("Should get and collect a legacy loan", function() {
    //     //get a loan which defaults in 1 sec
    //     const loanManagerAddress = '0xF7B8384c392fc333d3858a506c4F1506af44D53c'
    //     getLoan(0, 50, 50.00, 0.05061, loanManagerAddress).then(res => {
    //         cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]")
    //             .first()
    //             .click({
    //                 force: true
    //             });
    //
    //         // TODO : little differences between amounts caused by rounding and decimals
    //         // cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 50);
    //         cy.get("[data-testid=reservesMenuLink").click();
    //         // // TODO: check reserves
    //         cy.get("[data-testid=loansToCollectButton]").click();
    //         cy.get("[data-testid=collectLoanButton]").click();
    //
    //         cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Collect loan(s) submitted");
    //         cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();
    //
    //         cy.get("[data-testid=EthConfirmationReceivedPanel]").should("contain", "confirmation");
    //         cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]")
    //             .first()
    //             .click();
    //
    //         cy.get("[data-testid=loansToCollectBlock]", { timeout: 8000 }).should(
    //             "contain",
    //             "No defaulted and uncollected loan."
    //         );
    //     });
    // });

    //  it("Should repay a legacy loan", function() {
    //      const loanManagerAddress = '0xF7B8384c392fc333d3858a506c4F1506af44D53c'
    //     getLoan(1, 50, 50.00, 0.05113, loanManagerAddress).then(() => {
    //         // TODO : little differences between amounts caused by rounding and decimals
    //         // cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 51);
    //
    //         cy.contains("this loan's page")
    //             .click({ force: true })
    //             .then(() => {
    //                 cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]")
    //                     .first()
    //                     .click();
    //             });
    //
    //         cy.get("[data-testid=repayLoanButton]").click();
    //         cy.get("[data-testid=confirmRepayButton]").click();
    //
    //         cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Repayment submitted");
    //
    //         cy.get("[data-testid=EthConfirmationReceivedPanel]").should("contain", "confirmation");
    //         cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]").click();
    //
    //         cy.assertUserAEurBalanceOnUI(this.startingAeurBalance - 0.01); // interest
    //
    //         // TODO loan removed, status etc.
    //         //cy.get("[data-testid=myAccountMenuLink]").click();
    //     });
    // });
});
