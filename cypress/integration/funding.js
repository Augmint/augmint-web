describe("Augmint funding", function() {
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    it("Should show fund input label when add funds selected", function() {
        cy.get("[data-testid=addFundsTab]").click();

        cy.get("[data-testid=addFundsLabel]").should("contain", "Fund from bank account");
        cy.get("[data-testid=addFundsLink]")
            .should("have.attr", "href")
            .and("include", "buy");
    });

    it("Should show withdraw input label when withdraw selected", function() {
        cy.get("[data-testid=withdraw-tab]").click();

        cy.get("[data-testid=withdrawLabel]").should("contain", "Withdraw to bank account");
        cy.get("[data-testid=withdrawLink]")
            .should("have.attr", "href")
            .and("include", "sell");
    });
});
