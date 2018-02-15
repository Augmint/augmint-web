import React from "react";

import "./style.css";

export default class Disclaimer extends React.Component {
    render() {
        return (
          <div className="disclaimer">
              <p>
                The tokens issued by Augmint contracts are not legal tender.  Use them  at your own risk. To be used to replace, substitute or imitate any existing fiat currency might be subject to regulatory regimes.  Augmint tokens are not to be issued to entities residing under regulatory regimes prohibiting ownership or usage.  Use of Augmint contracts is at the owner's risk.
              </p>
              <p>
                Augmint project or any party who is contributing to the project cannot be held responsible for any damages, costs, expenses, anticipated savings, losses, errors, taxes, third party transactions, fees or delays encountered when interacting with Augmint contracts. Augmint Project is not responsible for any problems that may result from the use of your internet connection, our website, the Ethereum platform,  any contributors website, or any problems arising from the Ethereum code.  Dissatisfaction with any goods or services purchased from, or sold to, a third party must be resolved directly with that third party.  The Augmint contracts are provided as is and without any representation of warranty, whether express, implied, or statutory.  The limitations of liability of these contracts are agreed by the parties on the basis that the user is aware of the volatility of the foreign currency and Cryptocurrency markets.
              </p>
              <p>
                Augmint Project  reserves the right to amend, change, add, remove, or alter parts of the above text.
              </p>
          </div>
        );
    }
}
