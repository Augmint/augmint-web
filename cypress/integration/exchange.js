describe("Augmint exchange", function() {
    let tradeHistoryStartLength = document.querySelectorAll("[data-testid=trade-history] tbody tr").length;
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
        cy.getGasPriceInEth().as("gasPriceInEth");
    });

    it("Should place and cancel buy order on exchange and also check the trade history", function() {
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

        cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength);


        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").as("successPanel");

        cy
            .get("@successPanel")
            .contains("Successful order")
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-orderid")
                    .as("orderId");

                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("orderGasUsed");
            })
            .then(() => {
                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) - ethAmount - parseInt(this.orderGasUsed) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy.get("[data-testid=msgPanelOkButton]").click();
                cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 1);

                // TODO: check orderlist
                // TODO: check tradelist

                // Cancel order
                cy.get(`[data-testid=myOrdersBlock] [data-testid=cancelOrderButton-${this.orderId}]`).click();
                cy.get(`[data-testid=confirmCancelOrderButton-${this.orderId}`).click();
                cy.get("@successPanel").contains("Order cancelled");
                cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 2);

            })
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("cancelGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=acknowledgeFlashButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) -
                    (parseInt(this.cancelGasUsed) + parseInt(this.orderGasUsed)) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);
            });
    });

    it("Should place and cancel sell order on exchange and also check the trade history", function() {
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

        cy.get("[data-testid=EthSubmissionSuccessPanel]").as("successPanel");

        cy
            .get("@successPanel")
            .contains("Successful order")
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-orderid")
                    .as("orderId");

                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("orderGasUsed");
            })
            .then(() => {
                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) - parseInt(this.orderGasUsed) * this.gasPriceInEth;
                const expectedAEurBalance = Math.round((this.startingAeurBalance - tokenAmount) * 100) / 100; // 2397.99 - 997 = 1400.9899999999998
                cy.assertUserAEurBalanceOnUI(expectedAEurBalance);
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 3);

                cy.get("[data-testid=msgPanelOkButton]").click();

                // TODO: check orderlist
                // TODO: check tradelist

                // Cancel order
                cy.get(`[data-testid=myOrdersBlock] [data-testid=cancelOrderButton-${this.orderId}]`).click();
                cy.get(`[data-testid=confirmCancelOrderButton-${this.orderId}`).click();
                cy.get("@successPanel").contains("Order cancelled");
                cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 4);
            })
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("cancelGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=acknowledgeFlashButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) -
                    (parseInt(this.cancelGasUsed) + parseInt(this.orderGasUsed)) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);
            });
    });

    it("Should match a buy and sell order and also check the trade history", function() {
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

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").as("successPanel");
        cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 5);

        cy
            .get("@successPanel")
            .contains("Successful order")
            .then(() => {
                cy.get("[data-testid=msgPanelOkButton]").click();

                cy.get("[data-testid=buyMenuLink]").click();

                cy
                    .get("[data-testid=tokenAmountInput]")
                    .type(tokenAmount)
                    .should("have.value", tokenAmount.toString());

                cy.get("[data-testid=submitButton]").click();
                cy.get("@successPanel").contains("Successful order");
                cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 6);
            })
            .then(() => {
                cy.get("[data-testid=msgPanelOkButton]").click();
                cy.get("[data-testid=matchTopOrdersButton]").click();
                cy.get("@successPanel").contains("Successful match").then(() => {
                  cy.get("[data-testid=trade-history] tbody").children().should('have.length', tradeHistoryStartLength + 8);
                });
                cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();
                // TODO: check balances (it might be too complicated to make test independent, i.e. unsure what are the top orders b/c of prev tests' leftovers)
            });
    });
});
