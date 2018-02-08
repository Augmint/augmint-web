import React from "react";

import "./style.css";

export default class Manifesto extends React.Component {
    render() {
        return (
          <div className="manifesto">
              <h3>Manifesto</h3>
              <p>
                The Augmint Project is a free association of stakeholder individuals, groups, and organizations who have made common cause to create and maintain an open, decentralised, and distributed ledger based stable cryptocurrency  system.
              </p>
              <p>
                The goal of this manifesto is to set up fundamental principles to ensure that Augmint vision is sustainable in the long term.
              </p>
              <h4>Augmint mission</h4>
              <ol type="1">
                  <li>Augmint’s goal is to create new digital utility tokens, stable cryptocurrencies which are independent, transparent, open source, decentralized and used worldwide.</li>
                  <li>Each Augmint digital utility tokens’ value is pegged to one or more fiat currencies or other real world indexes.</li>
                  <li>Supply of Augmint utility tokens is flexible according to the economic demand. Augmint tokens can exclusively be created against minimum an equivalent value deposited in a smart contract and in the form of loan created by individual decisions of economic actors.</li>
                  <li>An Augmint utility token is for means of exchange, store of value and unit of account.</li>
                  <li>Augmint must not discriminate against any person or group of people.</li>
              </ol>
              <h4>Role of DAO</h4>
              <ol type="1" start="6">
                  <li>Augmint operates as Digital Autonomous Organisation (DAO).</li>
                  <li>Operation of the DAO is fully transparent.</li>
                  <li>The primary role of the DAO is to ensure the stability of each Augmint digital token by managing operations, Augmint reserves, foundation budget, and technical architecture.</li>
                  <li>The Stakeholder must endeavour to prevent any party to monopolise decision making and should aim to gradually delegate its own decision-making power to decentralised algorithms.</li>
                  <li>Augmint DAO is supervised by Augmint Community Board, ACoB, which members  are elected by Augmint stakeholders.</li>
              </ol>
              <h4>Stakeholder community</h4>
              <ol type="1" start="11">
                  <li>Stakeholders are holding power to vote in Augmint matters to practice control over the DAO and participate in decision making.</li>
                  <li>Open governance structure – anybody can join anytime without particular advantage to incumbent users.</li>
                  <li>Free earnings from the Augmint systems are distributed among the Stakeholders.</li>
              </ol>
          </div>
        );
    }
}
