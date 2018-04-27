describe("Augmint exchange", function() {
    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
        cy.getUserEthBalance().as("startingEthBalance");
        cy.getGasPriceInEth().as("gasPriceInEth");
    });

    it("Should place and cancel buy order on exchange and also check the trade history", function() {
        const tokenAmount = 1000;
        const ethAmount = 1.00301;
        const price = 997;

        let tradeHistoryStartLength;

        cy.get("[data-testid=exchangeMenuLink]").click();

        cy.get("[data-testid=trade-history] tbody").as("tradeHistoryTbody");
        cy
            .get("@tradeHistoryTbody")
            .then(() => {
                cy
                    .get("@tradeHistoryTbody")
                    .invoke("attr", "data-test-historycount")
                    .as("tradeHistoryStartLength");
            })
            .then(() => {
                tradeHistoryStartLength = parseInt(this.tradeHistoryStartLength);
            });

        cy
            .get("[data-testid=priceInput]")
            .type("{selectall}" + price)
            .should("have.value", price.toString());

        cy
            .get("[data-testid=tokenAmountInput]")
            .type(tokenAmount)
            .should("have.value", tokenAmount.toString());

        cy.get("[data-testid=ethAmountInput]").should("have.value", ethAmount.toString());

        cy
            .get("@tradeHistoryTbody")
            .then(() => {
                cy
                    .get("@tradeHistoryTbody")
                    .invoke("attr", "data-test-historycount")
                    .as("tradeHistoryCurrentLength");
            })
            .then(() => {
                expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength);
            });

        cy.get("[data-testid=submitButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order submitted");

        cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .should("contain", "confirmation")
            .as("successPanel");

        cy
            .get("@successPanel")
            .contains("confirmation")
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
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();
                cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) - ethAmount - parseInt(this.orderGasUsed) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "NewOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 1);
                    });

                // TODO: check orderlist
                // TODO: check tradelist

                // Cancel order
                cy.get(`[data-testid=myOrdersBlock] [data-testid=cancelOrderButton-${this.orderId}]`).click();
                cy.get(`[data-testid=confirmCancelOrderButton-${this.orderId}`).click();
                cy.get("@successPanel").contains("confirmation");
            })
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("cancelGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) -
                    (parseInt(this.cancelGasUsed) + parseInt(this.orderGasUsed)) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "CancelledOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 2);
                    });
            });
    });

    it("Should place and cancel sell order on exchange and also check the trade history", function() {
        const tokenAmount = 997;
        const ethAmount = 1;
        const price = 997;

        let tradeHistoryStartLength;

        cy.get("[data-testid=exchangeMenuLink]").click();
        cy.get("[data-testid=sellMenuLink]").click();

        cy.get("[data-testid=trade-history] tbody").as("tradeHistoryTbody");
        cy
            .get("@tradeHistoryTbody")
            .then(() => {
                cy
                    .get("@tradeHistoryTbody")
                    .invoke("attr", "data-test-historycount")
                    .as("tradeHistoryStartLength");
            })
            .then(() => {
                tradeHistoryStartLength = parseInt(this.tradeHistoryStartLength);
            });

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

        cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order submitted");

        cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .should("contain", "confirmation")
            .as("successPanel")
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
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();
                cy.get("[data-testid=EthSubmissionSuccessPanel] >[data-testid=msgPanelOkButton]").click();

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) - parseInt(this.orderGasUsed) * this.gasPriceInEth;
                const expectedAEurBalance = Math.round((this.startingAeurBalance - tokenAmount) * 100) / 100; // 2397.99 - 997 = 1400.9899999999998
                cy.assertUserAEurBalanceOnUI(expectedAEurBalance);
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "NewOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 1);
                    });

                // TODO: check orderlist
                // TODO: check tradelist

                // Cancel order
                cy.get(`[data-testid=myOrdersBlock] [data-testid=cancelOrderButton-${this.orderId}]`).click();
                cy.get(`[data-testid=confirmCancelOrderButton-${this.orderId}`).click();

                cy.get("@successPanel").should("contain", "confirmation");
            })
            .then(() => {
                cy
                    .get("@successPanel")
                    .invoke("attr", "data-test-gasused")
                    .as("cancelGasUsed");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.assertUserAEurBalanceOnUI(this.startingAeurBalance);

                const expectedEthBalance =
                    parseFloat(this.startingEthBalance) -
                    (parseInt(this.cancelGasUsed) + parseInt(this.orderGasUsed)) * this.gasPriceInEth;
                cy.assertUserEthBalanceOnUI(expectedEthBalance);

                cy
                    .get("@tradeHistoryTbody")
                    .should("contain", "CancelledOrder")
                    .then(() => {
                        cy
                            .get("@tradeHistoryTbody")
                            .invoke("attr", "data-test-historycount")
                            .as("tradeHistoryCurrentLength");
                    })
                    .then(() => {
                        expect(parseInt(this.tradeHistoryCurrentLength)).to.equal(tradeHistoryStartLength + 2);
                    });
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

        cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

        cy
            .get("[data-testid=EthConfirmationReceivedPanel]")
            .should("contain", "confirmation")
            .as("successPanel")
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("[data-testid=buyMenuLink]").click();

                cy
                    .get("[data-testid=tokenAmountInput]")
                    .type(tokenAmount)
                    .should("have.value", tokenAmount.toString());

                cy.get("[data-testid=submitButton]").click();

                cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order submitted");
                cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("@successPanel").should("contain", "confirmation");
            })
            .then(() => {
                cy.get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("[data-testid=matchTopOrdersButton]").click();

                cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Order match submitted");
                cy.get("[data-testid=EthSubmissionSuccessPanel] > [data-testid=msgPanelOkButton]").click();

                cy.get("@successPanel").should("contain", "confirmation");
                cy
                    .get("[data-testid=EthConfirmationReceivedPanel] > [data-testid=msgPanelOkButton]")
                    .click()
                    .then(() => {
                        cy.get("[data-testid=trade-history] tbody").as("tradeHistoryTbody");
                        cy.get("@tradeHistoryTbody").then(() => {
                            cy.get("@tradeHistoryTbody").should("contain", "OrderFill");
                        });
                    });
                // TODO: check balances (it might be too complicated to make test independent, i.e. unsure what are the top orders b/c of prev tests' leftovers)
            });
    });
});
