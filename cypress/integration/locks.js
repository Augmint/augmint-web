describe("Locks", function() {
    const getLock = (prodId, disbursedAmount) => {
        cy.get("[data-testid=lockMenuLink]").click();
        cy.get(`[data-testid=newLockLink]`).click();

        cy.wait(50);
        cy.get(`[data-testid=lock-product-selector]`)
            .select(prodId.toString(), { force: true })
            .should("have.value", prodId.toString());

        cy.get("[data-testid=lockAmountInput]")
            .clear()
            .type(disbursedAmount.toString())
            .should("have.value", disbursedAmount.toString());

        cy.get(`[data-testid=submitButton]`).click();
        cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("New Lock submitted");
        cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

        return cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .click()
            .within(() => {
                cy.contains("New lock");
                cy.contains("View on Etherscan.");
                cy.get("[data-testid=msgPanelClose]").click();
            });
    };

    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    it("Should lock A-EUR", function() {
        getLock(9, 50).then(() => {
            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance - 50);
        });
    });

    it("Should release locked A-EUR", function() {
        getLock(9, 50).then(() => {
            cy.wait(3000); // to make sure the lock is releasable
            cy.get("[data-testid=lockMenuLink]")
                .click()
                .then(() => {
                    cy.get("[data-testid=lockCard] [data-testid=releaseLockButton]")
                        .first()
                        .click();
                    cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]");

                    cy.get("[data-testid=EthConfirmationReceivedPanel]").contains("confirmation");
                    cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelClose]").click();
                });
        });
    });
});
