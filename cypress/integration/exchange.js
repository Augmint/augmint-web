describe("Augmint exchange", function() {
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
    });

    it("Should place and cancel buy order on exchange", function() {
        const tokenAmount = 1000;
        const ethAmount = 1.00301;
        const price = 997;

        cy.get("[data-testid=exchangeMenuLink]").click();

        cy
            .get("[data-testid=priceInput]")
            .type("{selectall}" + price)
            .should("have.value", price.toString());

        cy
            .get("[data-testid=tokenAmountInput]")
            .type(tokenAmount)
            .should("have.value", tokenAmount.toString());

        cy.get("[data-testid=ethAmountInput]").should("have.value", ethAmount.toString());

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("Successful order");

        cy.get("[data-testid=msgPanelOkButton]").click();

        cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

        cy.assertUserEthBalanceOnUI(this.startingEthBalance - ethAmount, 8);

        // TODO: check orderlist
        // TODO: check tradelist
        // TODO: cancel order
    });

    it("Should place and cancel sell order on exchange", function() {
        const tokenAmount = 997;
        const ethAmount = 1;
        const price = 997;

        cy.get("[data-testid=exchangeMenuLink]").click();
        cy.get("[data-testid=sellMenuLink]").click();

        cy
            .get("[data-testid=priceInput]")
            .type("{selectall}" + price)
            .should("have.value", price.toString());

        // NB: only works with integers, see: https://github.com/cypress-io/cypress/issues/1171
        cy
            .get("[data-testid=ethAmountInput]")
            .type(ethAmount)
            .should("have.value", ethAmount.toString());

        cy.get("[data-testid=tokenAmountInput]").should("have.value", tokenAmount.toString());

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").contains("Successful order");

        cy.get("[data-testid=msgPanelOkButton]").click();

        cy.assertUserAEurBalanceOnUI(this.startingAeurBalance - tokenAmount);

        cy.assertUserEthBalanceOnUI(parseFloat(this.startingEthBalance), 8);

        // TODO: check orderlist
        // TODO: check tradelist
        // TODO: cancel order
    });

    it("Should match a buy and sell order");
});
