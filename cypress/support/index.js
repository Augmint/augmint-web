// ***********************************************************
// Main support file for test. It's processed and loaded automatically before all test files.
// You can read more here: https://on.cypress.io/configuration
// ***********************************************************

import "./commands";

before(function() {
    cy.ganacheTakeSnapshot();
    cy.issueTo(100000); // to make tests independent. issue to accounts[0] by default (amount with token decimals)

    cy.visit("/");
    cy.get("[data-testid=tryItButton]").click();
    cy.get("[data-testid=TryItConnectedPanel]").should("contain", "You are connected");
    cy.get("[data-testid=disclaimerCloseButton").click();
});

after(function() {
    cy.ganacheRevertSnapshot();
});

const defaultWhitelist = xhr => {
    // this function receives the xhr object in question and
    // will whitelist if it's a GET that appears to be a static resource
    return xhr.method === "GET" && /\.(jsx?|html|css)(\?.*)?$/.test(xhr.url);
};

Cypress.Server.defaults({
    whitelist: xhr => {
        // hide logging web3 polling XHR request to testrpc
        return (
            (xhr.method === "POST" && xhr.url === "http://localhost:8545/") ||
            (xhr.method === "GET" && xhr.url.slice(0, 34) === "http://localhost:3000/sockjs-node/") ||
            defaultWhitelist(xhr)
        );
    }
});
