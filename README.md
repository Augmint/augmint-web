# Augmint - Stable Digital Tokens
Proof of concept implementation of a stable cryptocurrency in Ethereum

_a project by_ ![DECENT](http://www.decent.org/images/logo-voronoi_120x33.png)

## Concept
Augmint provides digital tokens, value of each token pegged to a fiat currency.

The first Augmint token will be ACD (Aug Crypto Dollar), pegged to USD.

The value of 1 ACD is always closely around 1 USD.

Augmint tokens are cryptocurrency tokens with all the benefits of cryptocurrencies: stored securely in a decentralised manner and instantly transferable worldwide.

Read more and try out the proof-of-concept implementation on **[www.augmint.cc](http://www.augmint.cc)**

**[White paper draft](http://bit.ly/augmint-wp)** - Work in progress. Please feel free to comment it: questions, ideas, suggestions are welcome.

## Components
### Solidity Contracts
* [Owned.sol](./contracts/Owned.sol)  
  Standard onlyOwner implementation. Going to be replaced to support more elaborate TokenUcd & LoanManager governance rules.
* [ERC20Impl.sol](./contracts/ERC20Impl.sol)  
  Standard [ERC20](https://theethereum.wiki/w/index.php/ERC20_Token_Standard) token base.
  * Maintains ACD balances of token holders
  * ACD transfers b/w accounts
  * Manages withdrawal pre-approvals
* [TokenUcd.sol](./contracts/TokenUcd.sol)
  ACD token contract, derived from ERC20Impl.
  * Sets standard token parameters (name, symbol, decimals, etc.)
  * Issue and burn ACD
  * Holds ACD & ETH reserves
  * Send reserve for auction (not implemented yet) when intervening
* [Rates.sol](./contracts/Rates.sol)  
  A mock oracle contract to return USD/ETH exchange rates
* [Exchange.sol](./contracts/Exchange.sol)  
  A basic ACD / ETH exchange contract. Sell or buy ACD for ETH on USD/ETH market rates.
* [LoanManager.sol](./contracts/LoanManager.sol)  
  * Maintains loan products and their parameters
  * Maintains a list of all loan contracts
  * Create new loan
  * Repay and default loans
* [EthBackedLoan.sol](./contracts/EthBackedLoan.sol)  
  One contract for each loan, owned by borrower, managed by LoanManager.
  * Holds loan state and all loan parameters
  * Holds ETH collateral

 ## Contribution
 We are seeking for great minds to extend our core team. Contribution in any area is much appreciated: development, testing, UX&UI design, legal, marketing etc.


**[Development environment setup](docs/developmentEnvironment.md)**

## Authors
![DECENT](http://www.decent.org/images/logo-voronoi_120x33.png)

[DECENT Labs](http://www.decent.org) production

### Concept, initial version
* [szerintedmi](https://github.com/szerintedmi)
* [Charlie](https://github.com/krosza)

## Licence
This project is licensed under the GNU General Public License v3.0 license - see the [LICENSE](LICENSE) file for details.
