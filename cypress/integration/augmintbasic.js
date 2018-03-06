/*
    TODO:
        - split into multiple
*/

describe("Augmint basic e2e", function() {
    const getLoan = (prodId, disbursedAmount, repaymentAmount, ethAmount) => {
        cy.get("[data-testid=getLoanMenuLink]").click();

        cy.get(`[data-testid=selectLoanProduct-${prodId}]`).click();
        cy.get("[data-testid=selectedLoanProductBlock]").should("contain", "Selected: loan product " + (prodId + 1));
        // NB: only works with integers, see: https://github.com/cypress-io/cypress/issues/1171
        cy
            .get("[data-testid=loanTokenAmountInput]")
            .type(disbursedAmount.toString())
            .should("have.value", disbursedAmount.toString());
        cy.get("[data-testid=repaymentAmountInput]").should("have.value", repaymentAmount.toString());
        cy.get("[data-testid=ethAmountInput]").should("have.value", ethAmount.toString());

        cy.get("[data-testid=submitBtn]").click();

        return cy
            .get("[data-testid=EthSubmissionSuccessPanel]")
            .within(() => {
                cy.contains("You've got a loan");
                cy.contains("Disbursed: " + disbursedAmount + " A-EUR");
                cy.contains("To be repaid: " + repaymentAmount + " A-EUR");
                cy.contains("Collateral in escrow: " + ethAmount + " ETH");
            })
            .as("@submissionSuccess");
    };

    before(function() {
        cy.ganacheTakeSnapshot();
        cy.issueTo(100000); // to make tests independent. issue to accounts[0] by default (amount with token decimals)
        cy.visit("/");
        cy.get("[data-testid=useAEurButton]").click();
        cy.get("[data-testid=TryItConnectedPanel]").should("contain", "You are connected");
    });

    beforeEach(function() {
        cy.getUserAEurBalance().as("startingAeurBalance");
    });

    after(function() {
        cy.ganacheRevertSnapshot();
    });

    it("Under the hood", function() {
        cy.visit("/under-the-hood");

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

    it("Should get and collect a loan", function() {
        //get a loan which defaults in 1 sec
        getLoan(6, 1000, 1010.11, 1.06541).then(res => {
            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 1000);
            cy.get("[data-testid=reservesMenuLink").click();
            // // TODO: check reserves
            cy.get("[data-testid=loansToCollectButton]").click();
            cy.get("[data-testid=collectLoanButton]").click();
            cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Successful collection of 1 loans");
            cy.get("[data-testid=loansToCollectBlock]").should("contain", "No defaulted and uncollected loan.");
        });
    });

    it("Should repay a loan", function() {
        getLoan(0, 200, 250, 0.31313).then(() => {
            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance + 200);

            cy.contains("this loan's page").click();
            cy.get("[data-testid=repayLoanButton]").click();
            cy.get("[data-testid=confirmRepayButton]").click();

            cy.get("[data-testid=EthSubmissionSuccessPanel]").should("contain", "Successful repayment");

            cy.assertUserAEurBalanceOnUI(this.startingAeurBalance - 50); // interest

            // TODO loan removed, status etc.
            //cy.get("[data-testid=myAccountMenuLink]").click();
        });
    });

    it("Should transfer A-EUR", function() {
        const amount = 100;
        const fee = 0.2;
        const toAddress = "0x5e09B21cCF42c1c30ca9C1C8D993d922E7c0d036";
        const narrative = "cypress test transfer";
        const expBal = this.startingAeurBalance - amount - fee;

        cy.get("[data-testid=myAccountMenuLink]").click();

        cy
            .get("[data-testid=transferAmountInput]")
            .type(amount)
            .should("have.value", amount.toString());

        cy
            .get("[data-testid=transferNarrativeField] > input")
            .type(narrative)
            .should("have.value", narrative);

        cy
            .get("[data-testid=transferFeeAmount]")
            .invoke("text")
            .should("equal", fee.toString());

        cy
            .get("[data-testid=transferToAddressField] > input")
            .type(toAddress)
            .should("have.value", toAddress);

        cy.get("[data-testid=submitTransferButton]").click();

        cy.get("[data-testid=EthSubmissionSuccessPanel]").within(() => {
            cy.contains("Successful transfer");
            cy.contains("Sent " + amount + " A-EUR to " + toAddress.toLowerCase());
        });

        cy
            .get("[data-testid=transactionHash]")
            .invoke("text")
            .as("txHash")
            .then(() => {
                cy.get(`[data-testid=transferListItem-${this.txHash}]`).within(() => {
                    cy.contains("To: " + toAddress);
                    cy.contains("Amount: -" + amount);
                    cy.contains("Fee: " + fee);
                    cy.contains(narrative);
                });
            });

        cy.assertUserAEurBalanceOnUI(expBal);
    });

    it("Should buy/sell A-EUR on exchange");

    it("Should lock and release A-EUR");
    it("Should buy A-EUR from reserve");
});
