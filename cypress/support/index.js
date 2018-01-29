// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

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
            (xhr.method === "GET" &&
                xhr.url.slice(0, 34) ===
                    "http://localhost:3000/sockjs-node/") ||
            defaultWhitelist(xhr)
        );
    }
});
