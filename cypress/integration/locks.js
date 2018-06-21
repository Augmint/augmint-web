describe("Locks", function() {
    const getLock = (prodId, disbursedAmount) => {
        cy.get("[data-testid=lockMenuLink]").click();

        cy.get(`[data-testid=selectLockProduct-${prodId}]`).then(() => {
            cy
                .get("[data-testid=lockAmountInput]")
                .type(disbursedAmount.toString())
                .should("have.value", disbursedAmount.toString())
        });
        cy.get(`[data-testid=selectLockProduct-${prodId}]`).click();

        cy.get(`[data-testid=submitButton]`).click();
        cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("New Lock submitted")
        cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();
        
        return cy.get("[data-testid=EthConfirmationReceivedPanel]").within(() => {
            cy.contains("New lock");
            cy.contains("Tx hash:");
        });
    };
    
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });
    
    it("Should lock A-EUR", function() {
        getLock(8, 50).then(() => {
            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance - 50);
            cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();
        });
    });

    it("Should release locked A-EUR", function() {        
        getLock(8, 50).then(() => {
            cy.get("[data-testid=EthConfirmationReceivedPanel]").within(() => {
                cy.contains("1. New lock", { timeout: 8000 });
            });
            cy.get("[data-testid=myAccountMenuLink]").click().then(() => {
                cy.get("[data-testid=LockListBlock] [data-testid=releaseLockButton]").first().click();
                cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("Funds release transaction submitted");
            });
        });
    });
});
