describe("Augmint funding", function() {
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    const getAddFundsTab = () => {
        cy.get("[data-testid=fundingMenuLink]").click();
        cy.get("[data-testid=addFundsTab]").click();
    };

    const getWithdrawTab = () => {
        cy.get("[data-testid=fundingMenuLink]").click();
        cy.get("[data-testid=withdrawTab]").click();
    };

    it("Should show fund input label when add funds selected", function() {
        getAddFundsTab();

        cy.get("[data-testid=addFundsLabel]").should("contain", "Send from bank account");
    });

    it("Should go to buy link when add funds selected", function() {
        getAddFundsTab();

        cy.get("[data-testid=addFundsLink]")
            .should("have.attr", "href")
            .and("include", "EUR/to/Augmint-Euro-Token/AEUR");
    });

    it("Should show withdraw input label when withdraw selected", function() {
        getWithdrawTab();

        cy.get("[data-testid=withdrawLabel]").should("contain", "Send to bank account");
    });

    it("Should go to sell link when withdraw selected", function() {
        getWithdrawTab();

        cy.get("[data-testid=withdrawLink]")
            .should("have.attr", "href")
            .and("include", "/Augmint-Euro-Token/AEUR/to/Euro");
    });
});
