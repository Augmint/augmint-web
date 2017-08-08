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
            network_id: "*", // Match any network id
            gas: 4707806
        }
    }
};
