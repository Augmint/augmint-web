describe("Loans", function() {
    const getLoan = (prodId, disbursedAmount, repaymentAmount, ethAmount) => {
        cy.get("[data-testid=getLoanMenuLink]").click();

        cy.get(`[data-testid=selectLoanProduct-${prodId}]`).click();
        cy.get("[data-testid=selectedLoanProductBlock]").should("contain", "Selected: loan product " + (prodId + 1));
        // NB: only works with integers, see: https://github.com/cypress-io/cypress/issues/1171
        cy
            .get("[data-testid=loanTokenAmountInput]")
            .type(disbursedAmount.toString())
            .should("have.value", disbursedAmount.toString());
        cy.get("[data-testid=repaymentAmountInput]").should("have.value", repaymentAmount.toString());
        cy.get("[data-testid=ethAmountInput]").should("have.value", ethAmount.toString());

        cy.get("[data-testid=submitBtn]").click();
        cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("New loan submitted");

        return cy.get("[data-testid=EthConfirmationReceivedPanel]").within(() => {
            cy.contains("New loan");
            cy.contains("Disbursed: " + disbursedAmount + " A-EUR");
            cy.contains("To be repaid: " + repaymentAmount + " A-EUR");
            cy.contains("Collateral in escrow: " + ethAmount + " ETH");
        });
    };

    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    it("Should get and collect a loan", function() {
        //get a loan which defaults in 1 sec
        getLoan(7, 50, 50.01, 0.05062).then(res => {
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 50);
            cy.get("[data-testid=reservesMenuLink").click();
            // // TODO: check reserves
            cy.get("[data-testid=loansToCollectButton]").click();
            cy.get("[data-testid=collectLoanButton]").click();

            cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Collect loan(s) submitted");
            cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();

            cy.get("[data-testid=EthConfirmationReceivedPanel]").should("contain", "confirmation");
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

            cy
                .get("[data-testid=loansToCollectBlock]", { timeout: 8000 }) // increase timeout b/c of occassional Travis timeouts
                .should("contain", "No defaulted and uncollected loan.");
        });
    });

    it("Should repay a loan", function() {
        getLoan(0, 50, 58.14, 0.10593).then(() => {
            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 50);

            cy
                .contains("this loan's page")
                .click()
                .then(() => {
                    cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();
                });

            cy.get("[data-testid=repayLoanButton]").click();
            cy.get("[data-testid=confirmRepayButton]").click();

            cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Repayment submitted");

            cy.get("[data-testid=EthConfirmationReceivedPanel]").should("contain", "confirmation");
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

            cy.assertUserAEurBalanceOnUI((this.startingAeurBalance - 8.14).toFixed(2)); // interest

            // TODO loan removed, status etc.
            //cy.get("[data-testid=myAccountMenuLink]").click();
        });
    });
});
