import { default as Web3 } from "web3";
import { default as Contract } from "truffle-contract";
import augmintToken_artifacts from "../../src/contractsBuild/TokenAEur.json";
import monetarySupervisor_artifacts from "../../src/contractsBuild/MonetarySupervisor.json";
import augmintReserves_artifacts from "../../src/contractsBuild/AugmintReserves.json";

let augmintTokenInstance = null;
let monetarySupervisorInstance = null;
let augmintReservesInstance = null;

let accounts = null;
let snapshotId;

let gasPrice;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

try {
    const augmintTokenContract = Contract(augmintToken_artifacts);
    augmintTokenContract.setProvider(web3.currentProvider);

    const monetarySupervisorContract = Contract(monetarySupervisor_artifacts);
    monetarySupervisorContract.setProvider(web3.currentProvider);

    const augmintReservesContract = Contract(augmintReserves_artifacts);
    augmintReservesContract.setProvider(web3.currentProvider);

    web3.eth.net.getId().then(networkId => {
        augmintTokenContract.setNetwork(networkId);
        augmintTokenInstance = augmintTokenContract.at(augmintTokenContract.address);

        monetarySupervisorContract.setNetwork(networkId);
        monetarySupervisorInstance = monetarySupervisorContract.at(monetarySupervisorContract.address);

        augmintReservesContract.setNetwork(networkId);
        augmintReservesInstance = augmintReservesContract.at(augmintReservesContract.address);
    });

    web3.eth.getAccounts().then(_accounts => {
        accounts = _accounts;
    });

    if (typeof web3.currentProvider.sendAsync !== "function") {
        web3.currentProvider.sendAsync = function() {
            return web3.currentProvider.send.apply(web3.currentProvider, arguments);
        };
    }
    const web3Version = web3.version.api ? web3.version.api : web3.version;
    console["log"]("web3 connected", web3Version);
    web3.eth.getGasPrice().then(res => {
        gasPrice = res;
    });
} catch (error) {
    throw new Error(`Error while connecting to Augmint contracts\n${error}`);
}

Cypress.Commands.add("ganacheTakeSnapshot", (options = {}) => {
    const startTime = new Date().getTime();

    return new Promise(function(resolve, reject) {
        web3.currentProvider.sendAsync(
            {
                method: "evm_snapshot",
                params: [],
                jsonrpc: "2.0",
                id: startTime
            },
            function(error, res) {
                if (error) {
                    reject(new Error("Can't take snapshot with web3\n" + error));
                } else {
                    const t = new Date().getTime();
                    snapshotId = res.result;
                    console["log"](
                        "ganacheTakeSnapshot snapshot ",
                        snapshotId + " was taken in ",
                        t - startTime + "ms"
                    );
                    resolve(res.result);
                }
            }
        );
    });
});

Cypress.Commands.add("ganacheRevertSnapshot", (options = {}) => {
    const startTime = new Date().getTime();
    return new Promise(function(resolve, reject) {
        web3.currentProvider.sendAsync(
            {
                method: "evm_revert",
                params: [snapshotId],
                jsonrpc: "2.0",
                id: startTime
            },
            function(error, res) {
                if (error) {
                    // TODO: this error is not bubbling up to truffle test run :/
                    reject(new Error("Can't revert snapshot with web3. snapshotId: " + snapshotId + "\n" + error));
                } else {
                    const t = new Date().getTime();
                    console["log"](
                        "ganacheRevertSnapshot snapshot ",
                        snapshotId + " reverted in" + (t - startTime) + "ms"
                    );
                    resolve(res);
                }
            }
        );
    });
});

Cypress.Commands.add("getGasPriceInEth", (options = {}) => {
    return parseFloat(web3.utils.fromWei(gasPrice));
});

// get user AEUR balance from ganache. Usage: cy.getUserAEurBalance or this.startingAeurBalance (set in before each)
Cypress.Commands.add("getUserAEurBalance", (account, options = {}) => {
    if (typeof account === "undefined") {
        account = accounts[0];
    }

    return augmintTokenInstance.balanceOf(account).then(bal => {
        return Number(bal) / 100;
    });
});

// get user ETH balance from ganache. Usage: cy.getUserEthBalance or this.startingEthBalance (set in before each)
Cypress.Commands.add("getUserEthBalance", (account, options = {}) => {
    if (typeof account === "undefined") {
        account = accounts[0];
    }

    return web3.eth.getBalance(account).then(bal => {
        return web3.utils.fromWei(bal);
    });
});

// assert user balance on UI.
Cypress.Commands.add("assertUserAEurBalanceOnUI", (balance, options = {}) => {
    cy.get("[data-testid=accountInfoBlock]").should("not.have.class", "loading");

    cy
        .get("[data-testid=userAEurBalance]")
        .invoke("text")
        .should("equal", balance.toString());
});

// assert user balance on UI.
Cypress.Commands.add("assertUserEthBalanceOnUI", (_expectedEth, decimals = 12, options = {}) => {
    const expectedEth = Number(_expectedEth.toFixed(decimals));
    cy.get("[data-testid=accountInfoBlock]").should("not.have.class", "loading");

    cy
        .get("[data-testid=userEthBalance]")
        .invoke("text")
        .should(val => {
            // TODO: this throws a lot of console warnings
            expect(Number(val)).to.be.approximately(expectedEth, 1 / 10 ** decimals);
        });
});

// issue AEUR to account
Cypress.Commands.add("issueTo", (tokenAmount, to, options = {}) => {
    if (typeof to === "undefined") {
        to = accounts[0];
    }

    return monetarySupervisorInstance
        .issueToReserve(tokenAmount, {
            from: accounts[0],
            gas: 400000
        })
        .then(res => {
            return augmintReservesInstance.withdraw(
                augmintTokenInstance.address,
                to,
                tokenAmount,
                0,
                "token withdrawal for tests",
                { from: accounts[0] }
            );
        });
});
