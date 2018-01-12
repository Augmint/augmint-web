/*
TODO: testprc crashes sometime from these tests (and with normal use too).
        Follow this bug: https://github.com/trufflesuite/ganache-cli/issues/453
*/

describe("Augmint basic e2e", function() {
    const getUserAceBalance = () => {
        return cy.get("#userAceBalance").then(bal => {
            return Number(Cypress.$("#userAceBalance").text());
        });
    };

    const getLoan = (prodId, disbursedAmount, repaymentAmount, ethAmount) => {
        cy.contains("Get ACE Loan").click();
        cy.contains("Select type of loan");
        cy.log("PROD", prodId);
        cy.get("#selectLoanProduct-" + prodId).click();
        cy.contains("Selected: loan product " + (prodId + 1));
        cy
            .get("#disbursedTokenAmount")
            .type(disbursedAmount)
            .should("have.value", disbursedAmount.toString());
        cy
            .get("#repaymentAmount")
            .should("have.value", repaymentAmount.toString());
        cy.get("#ethAmount").should("have.value", ethAmount.toString());
        return getUserAceBalance().then(aceBalanceBefore => {
            const expBal =
                Math.round((aceBalanceBefore + disbursedAmount) * 10000) /
                10000;
            cy.get("#submitBtn").click();
            cy.contains("You've got a loan");
            cy.contains("Disbursed: " + disbursedAmount + " ACE");
            cy.contains("To be repayed: " + repaymentAmount + " ACE");
            cy.contains("Collateral in escrow: " + ethAmount + " ETH");
            return cy
                .get("#userAceBalance")
                .contains(expBal.toString())
                .then(res => {
                    return cy
                        .get(".accountInfo")
                        .should("not.have.class", "loading");
                });
        });
    };

    before(function() {
        cy.visit("/");
        cy.contains("Try it").click();
        cy.contains("You are connected");
    });

    beforeEach(function() {
        cy.ganacheTakeSnapshot();
    });

    afterEach(function() {
        cy.ganacheRevertSnapshot();
    });

    it.skip("Click through main functions", function() {
        cy.contains("My Account").click();
        cy.contains("Account: 0x76E7a0aEc3E43211395bBBB6Fa059bD6750F83c3");
        cy.get("#transferListDiv");
        cy.contains("Get ACE Loan").click();
        cy.contains("Select type of loan");
        cy.get("#selectLoanProduct-0").click();

        cy.contains("Reserves").click();
        cy.contains("Augmint Reserves");
        cy.contains("0 ACE");

        cy.get("#loansToCollectBtn").click();
        cy.contains("No defaulted and uncollected loan.");
    });

    it("Should get and collect a loan", function() {
        //get a loan which defaults in 1 sec
        getLoan(6, 1000.55, 1010.66, 1.06598).then(res => {
            cy.contains("My Account").click();
            // TODO: check transfer history
            // TODO: check my loans
            // TODO: loan details page
            // TODO: Repayment
            // TODO: check reserves
        });
    });

    it("Should collect a loan");

    it.only("Should repay a loan", function() {
        cy.reload();
        // take 2 loans to have enough ace to repay one of them loan
        getLoan(0, 200, 250, 0.31313)
            .then(res => {
                return getLoan(0, 200, 250, 0.31313);
            })
            .then(res => {
                return getUserAceBalance();
            })
            .then(aceBalanceBefore => {
                const expBal =
                    Math.round((aceBalanceBefore - aceBalanceBefore) * 10000) /
                    10000;
                cy.contains("this loan's page").click();
                cy.get(".repayEarlyButton").click();
                cy.get(".confirmRepayButton").click();

                cy.contains("Successful repayment");
                cy
                    .get("#userAceBalance")
                    .contains(expBal.toString())
                    .then(res => {
                        cy.get(".accountInfo");
                        cy.should("not.have.class", "loading");
                    });
                cy.contains("My Account").click();
                // TODO loan removed, status etc.
            });
    });

    it("Should transfer ACE");

    it("Should buy/sell ACE on exchange");
    it("Should buy ACE from reserve");
});
