// Allows us to use ES6 in our migrations and tests.
require("babel-register");

module.exports = {
    /* TODO: tempfix because of issue: https://github.com/trufflesuite/truffle-migrate/issues/10
          for now ./build/contracts need to be copied manually to src/contractsBuild folder after every truffle migrate
    */
    //contracts_build_directory: './src/contractsBuild',
    //working_directory: './contracts',
    //migrations_directory: './migrations',
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "999",
            gas: 4707806
        },
        truffleLocal: {
            host: "localhost",
            port: 9545,
            network_id: "4447",
            gas: 4707806
        },
        privatechain: {
            host: "localhost",
            port: 8545,
            network_id: "1976",
            gas: 4707806
        },
        rinkeby: {
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            from: "0xae653250B4220835050B75D3bC91433246903A95", // default address to use for any transaction Truffle makes during migrations
            network_id: 4,
            gas: 4700000, // Gas limit used for deploys
            gasPrice: 1000000000 // 1 Gwei
        },
        ropsten: {
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            network_id: 3,
            gas: 4700000, // Gas limit used for deploys
            gasPrice: 21000000000 // 21 Gwei
        }
    }
};
