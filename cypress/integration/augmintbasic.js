describe("Augmint base", function() {
    it("Under the hood", function() {
        cy.get("[data-testid=underTheHoodLink]").click();

        cy.get("[data-testid=baseInfoLink]").click();
        cy.get("[data-testid=web3ConnectionInfo]").contains("connected");
        cy.get("[data-testid=userAccountTokenBalance]").should("not.contain", "?");

        cy.screenshot("underthehood_baseinfo");

        cy.get("[data-testid=augmintInfoLink]").click();
        cy.get("[data-testid=MonetarySupervisor-connectionStatus]").should("contain", "connected | not loading");
        cy.get("[data-testid=AugmintToken-connectionStatus]").should("contain", "connected | not loading");
        cy.screenshot("underthehood_augmint_baseinfo");

        cy.get("[data-testid=loansInfoLink]").click();
        cy.get("[data-testid=LoanManager-connectionStatus]").should("contain", "connected | not loading");
        cy.screenshot("underthehood_loans");
    });

    it("Should display reserves", function() {
        cy.get("[data-testid=reservesMenuLink").click();

        cy.get("[data-testid=totalSupply]").should("not.contain", "?");
        cy.get("[data-testid=issuedByMonetaryBoard]").should("not.contain", "?");
        cy.get("[data-testid=reserveEthBalanceInFiat]").should("not.contain", "?");
        cy.get("[data-testid=reserveTokenBalance]").should("not.contain", "?");

        cy.get("[data-testid=feeAccountTokenBalance]").should("not.contain", "?");
        cy.get("[data-testid=interestEarnedAccountTokenBalance]").should("not.contain", "?");

        cy.get("[data-testid=loansToCollectButton]").click();
        cy.get("[data-testid=loansToCollectBlock]").should("contain", "No defaulted and uncollected loan.");
    });
});
