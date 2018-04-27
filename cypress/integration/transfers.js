describe("Transfers", function() {
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    it("Should transfer A-EUR", function() {
        const amount = 100;
        const fee = 0.2;
        const toAddress = "0x5e09B21cCF42c1c30ca9C1C8D993d922E7c0d036";
        const narrative = "cypress test transfer";
        const expBal = parseFloat((this.startingAeurBalance - amount - fee).toFixed(2));

        cy.get("[data-testid=myAccountMenuLink]").click();

        cy
            .get("[data-testid=transferAmountInput]")
            .type(amount)
            .should("have.value", amount.toString());

        cy
            .get("[data-testid=transferNarrativeField] > input")
            .type(narrative)
            .should("have.value", narrative);

        cy
            .get("[data-testid=transferFeeAmount]")
            .invoke("text")
            .should("equal", fee.toString());

        cy
            .get("[data-testid=transferToAddressField] > input")
            .type(toAddress)
            .should("have.value", toAddress);

        cy.get("[data-testid=submitTransferButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").within(() => {
            cy.contains("Token transfer submitted");
            cy.contains("Transfer " + amount + " A-EUR to " + toAddress);
        });

        cy.get("[data-testid=EthConfirmationReceivedPanel]").contains("confirmation");
        cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

        cy
            .get("[data-testid=transactionHash]")
            .invoke("text")
            .as("txHash")
            .then(() => {
                cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();
                cy.get(`[data-testid=transferListItem-${this.txHash}]`).within(() => {
                    cy.contains("To: " + toAddress);
                    cy.contains("Amount: -" + amount);
                    cy.contains("Fee: " + fee);
                    cy.contains(narrative);
                });
            });

        cy.assertUserAEurBalanceOnUI(expBal);
    });
});
