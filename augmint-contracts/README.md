<span style="display:block;text-align:center">![Augmint](http://www.augmint.cc/android-chrome-192x192.png)
</span>

# Augmint - Stable Digital Tokens - Solidity Contracts

Decentralised stable cryptocurrency on Ethereum

## Concept

Augmint provides digital tokens, value of each token pegged to a fiat currency.

The first Augmint token will be A-EUR (Augmint Crypto Euro), pegged to EUR.

The value of 1 A-EUR is always closely around 1 EUR.

Augmint tokens are cryptocurrency tokens with all the benefits of cryptocurrencies: stored securely in a decentralised manner and instantly transferable worldwide.

Read more and try it: **[www.augmint.cc](http://www.augmint.cc)**

**[Our Trello board](https://trello.com/b/RYGAt2so/augmint-documents)** with a collection of documents about the project.

**[White paper draft](http://bit.ly/augmint-wp)** - Work in progress. Please feel free to comment it: questions, ideas, suggestions are welcome.

## Components

[Web frontend repo](https://github.com/Augmint/augmint-web)

Sequence diagrams about the planned [Loan flow](docs/loanFlow.png) and [Exchange flow](docs/exchangeFlow.png). _NB: slightly outdated, needs update_

[Flow of funds](https://docs.google.com/drawings/d/13BP5sj-GZ41zdBC2WPIdfLpVJbYia_9Tdw5_g4M4Psg/edit?usp=sharing)

### Solidity Contracts

* [Restricted.sol](./contracts/generic/Owned.sol)  
   Stores which address can access which function call.
* [ERC20.sol](./contracts/generic/ERC20.sol)  
  Standard [ERC20](https://theethereum.wiki/w/index.php/ERC20_Token_Standard) token interface.
* [SystemAccount.sol](./contracts/generic/ERC20.sol)
  Generic contract to maintain balances of Augmint system accounts (InterestPoolAccount, InterestEarnedAccount, FeeAccount)
* [AugmintToken.sol](./contracts/generic/AugmintToken.sol)  
  Base contract for all Augmint tokens. ERC20.
    * Issue and burn ACD for new loans and on loan repayment
    * Convenience functions: getLoan, placeSellOrder (see [Loan flow](docs/loanFlow.png) and [Exchange flow](docs/exchangeFlow.png).)
    * Holds ETH and Augmint Token reserves
    * Send reserve for auction (not implemented yet) when intervening
* [AugmintToken.sol](./contracts/TokenAcd.sol)
    * AugmintToken contract for pegged Augmint tokens (A-EUR aka Augmint Crypto Euro is the first: [TokenAEur.sol](./contracts/TokenAEur.sol) )
    * Sets standard token parameters (name, symbol, decimals, etc.)
* [Rates.sol](./contracts/Rates.sol)  
  A contract to return fiat/ETH exchange rates
* [Exchange.sol](./contracts/Exchange.sol)  
  A-EUR / ETH exchange contract. Sell or buy A-EUR for ETH on A-EUR/ETH market rates.
* [LoanManager.sol](./contracts/LoanManager.sol)
    * Loan products and their parameters
    * Maintains all loans: new loans, repayment, collection
* [Locker.sol](./contracts/Lock.sol)
    * Lock products and parameters
    * Token fund locking and releasing

## Contribution

Augmint is an open and transparent project.

We are seeking for great minds to extend our core team. Contribution in any area is much appreciated: development, testing, UX&UI design, legal, marketing spreading the word etc.

Drop us an email: hello@augmint.cc
or say hi on our [Discord server](https://discord.gg/PwDmsnu)

**[Development environment setup](docs/developmentEnvironment.md)**

## Authors

![DECENT](http://www.decent.org/images/logo-voronoi_120x33.png)

The project was born at [DECENT Labs](http://www.decent.org)

### Concept, initial version

* [szerintedmi](https://github.com/szerintedmi)
* [Charlie](https://github.com/krosza)

Check the whole team on [augmint.cc](http://www.augmint.cc)

## Licence

This project is licensed under the GNU General Public License v3.0 license - see the [LICENSE](LICENSE) file for details.
