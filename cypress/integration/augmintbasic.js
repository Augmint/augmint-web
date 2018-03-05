/*
    TODO:
        - split into multiple
*/

describe("Augmint basic e2e", function() {
    const getUserAEurBalance = () => {
        return cy.get("[data-testid='userAEurBalance']").then(bal => {
            return Number(Cypress.$("[data-testid='userAEurBalance']").text());
        });
    };

    const getLoan = (prodId, disbursedAmount, repaymentAmount, ethAmount) => {
        cy.contains("Get A-EUR Loan").click();

        cy.get(`[data-testid='selectLoanProduct-${prodId}']`).click();
        cy
            .get("[data-testid='selectedLoanProductBlock']")
            .should("contain", "Selected: loan product " + (prodId + 1));
        // NB: only works with integers, see: https://github.com/cypress-io/cypress/issues/1171
        cy
            .get("[data-testid='loanTokenAmountField']")
            .type(disbursedAmount.toString())
            .should("have.value", disbursedAmount.toString());
        cy
            .get("[data-testid='repaymentAmountField']")
            .should("have.value", repaymentAmount.toString());
        cy
            .get("[data-testid='ethAmountField']")
            .should("have.value", ethAmount.toString());

        return getUserAEurBalance().then(aEurBalanceBefore => {
            const expBal =
                Math.round((aEurBalanceBefore + disbursedAmount) * 10000) /
                10000;
            cy.get("[data-testid='submitBtn']").click();
            cy
                .get("[data-testid='EthSubmissionSuccessPanel']")
                .contains("You've got a loan");
            cy.contains("Disbursed: " + disbursedAmount + " A-EUR");
            cy.contains("To be repaid: " + repaymentAmount + " A-EUR");
            cy.contains("Collateral in escrow: " + ethAmount + " ETH");
            cy
                .get("[data-testid='userAEurBalance']")
                .contains(expBal.toString())
                .then(res => {
                    cy.get(".accountInfo").should("not.have.class", "loading");
                });
        });
    };

    before(function() {
        cy.visit("/");
        cy.get("[tid='useAEurButton']").click();
        cy
            .get("[data-testid='TryItConnectedPanel']")
            .should("contain", "You are connected");
    });

    beforeEach(function() {
        cy.ganacheTakeSnapshot();
    });

    afterEach(function() {
        cy.ganacheRevertSnapshot();
    });

    it("Click through main functions", function() {
        cy.visit("/under-the-hood");

        cy.get("[data-testid='baseInfoLink']").click();
        cy.get("[data-testid='web3ConnectionInfo']").contains("connected");
        cy
            .get("[data-testid='userAccountTokenBalance']")
            .should("not.contain", "?");

        cy.screenshot("underthehood_baseinfo");

        cy.get("[data-testid='augmintInfoLink']").click();
        cy
            .get("[data-testid='MonetarySupervisor-connectionStatus']")
            .should("contain", "connected | not loading");
        cy
            .get("[data-testid='AugmintToken-connectionStatus']")
            .should("contain", "connected | not loading");
        cy.screenshot("underthehood_augmint_baseinfo");

        cy.get("[data-testid='loansInfoLink']").click();
        cy
            .get("[data-testid='LoanManager-connectionStatus']")
            .should("contain", "connected | not loading");
        cy.screenshot("underthehood_loans");

        cy.contains("My Account").click();
        cy
            .get("[data-testid='accountInfoBlock']")
            .should(
                "contain",
                "Account: 0x76E7a0aEc3E43211395bBBB6Fa059bD6750F83c3"
            );
        cy.get("[data-testid='transferListDiv']");

        cy.contains("Get A-EUR Loan").click();
        cy.get("[data-testid='selectLoanProduct-0']").click();

        cy.contains("Reserves").click();
        cy.get("[data-testid='totalSupply']").should("contain", "0 A-EUR");

        cy.get("[data-testid='loansToCollectBtn']").click();
        cy
            .get("[data-testid='loansToCollectBlock']")
            .should("contain", "No defaulted and uncollected loan.");
    });

    it("Should get and collect a loan", function() {
        //get a loan which defaults in 1 sec
        getLoan(6, 1000, 1010.11, 1.06541)
            .then(res => {
                return getUserAEurBalance();
            })
            .then(aEurBalanceBefore => {
                cy.contains("Reserves").click();
                // // TODO: check reserves
                cy.get(".loansToCollectButton").click();
                cy.get(".collectLoanButton").click();
                cy
                    .get("[data-testid='EthSubmissionSuccessPanel']")
                    .should("contain", "Successful collection of 1 loans");
            });
    });

    it("Should repay a loan", function() {
        cy.reload(); // required because ganache RevertSnapshot doesn't trigger events which messes up UI state
        // take 2 loans to have enough aEur to repay one of them loan
        getLoan(0, 200, 250, 0.31313)
            .then(res => {
                return getLoan(0, 200, 250, 0.31313);
            })
            .then(res => {
                return getUserAEurBalance();
            })
            .then(aEurBalanceBefore => {
                const expBal =
                    Math.round((aEurBalanceBefore - 250) * 10000) / 10000;

                cy.contains("this loan's page").click();
                cy.get(".repayEarlyButton").click();
                cy.get(".confirmRepayButton").click();

                cy
                    .get("[data-testid='EthSubmissionSuccessPanel']")
                    .should("contain", "Successful repayment");
                cy
                    .get("[data-testid='userAEurBalance']")
                    .should("contain", expBal);

                cy.get(".accountInfo");
                cy.should("not.have.class", "loading");

                cy.contains("My Account").click();
                // TODO loan removed, status etc.
            });
    });

    it("Should transfer A-EUR");

    it("Should buy/sell A-EUR on exchange");
    it("Should buy A-EUR from reserve");
});
