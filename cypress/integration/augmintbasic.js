describe("Augmint base", function() {
    it("Under the hood", function() {
        cy.get("[data-testid=underTheHoodLink]").click();

        cy.get("[data-testid=dismissLegacyBalanceButton-0]").click();

        cy.get("[data-testid=baseInfoLink]").click();
        cy.get("[data-testid=web3ConnectionInfo]").contains("connected");
        cy.get("[data-testid=userAccountTokenBalance]").should("not.contain", "?");

        cy.screenshot("underthehood_baseinfo");

        const expectedLoadStatus = "Loaded | not loading | No load error";
        cy.get("[data-testid=augmintInfoLink]").click();
        cy.get("[data-testid=MonetarySupervisor-dataStatus]").should("contain", expectedLoadStatus);
        cy.get("[data-testid=TokenAEur-dataStatus]").should("contain", "Loaded | not loading | No load error");

        cy.get("[data-testid=loansInfoLink]").click();
        cy.get("[data-testid=LoanManager-dataStatus]").should("contain", expectedLoadStatus);

        cy.get("[data-testid=locksInfoLink]").click();
        cy.get("[data-testid=Locker-dataStatus]").should("contain", expectedLoadStatus);

        cy.get("[data-testid=exchangeInfoLink]").click();
        cy.get("[data-testid=Exchange-dataStatus]").should("contain", expectedLoadStatus);
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
