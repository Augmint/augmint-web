import React from "react";

import "./style.css";

export default class Manifesto extends React.Component {
    render() {
        return (
            <div className="manifesto">
                <h3>Manifesto</h3>
                <p>
                    The Augmint Project is a free association of stakeholder individuals, groups, and organizations with
                    the common cause of creating and maintaining an open, decentralised, and distributed ledger-based
                    stable cryptocurrency system.
                </p>
                <p>
                    The goal of this manifesto is to lay out the fundamental principles that will ensure Augmint’s
                    vision is sustainable towards the long term.
                </p>
                <h4>Augmint mission</h4>
                <ol type="1">
                    <li>
                        Augmint’s goal is to create new digital utility tokens; stable cryptocurrencies which are
                        Independent, Transparent, Open source, Decentralized, and used Worldwide.
                    </li>
                    <li>
                        Each Augmint digital utility token’s value is targeted to one or more fiat currencies or other
                        real-world indices.
                    </li>
                    <li>
                        Supply of Augmint utility tokens is flexible according to the economic demand. Augmint tokens
                        may only be minted when backed by, at minimum, an equivalent value deposited in a smart
                        contract, or in the form of a loan created by independent economic actors.
                    </li>
                    <li>An Augmint utility token is for means of exchange, store of value, and unit of account.</li>
                    <li>Augmint must not discriminate against any person or group of people.</li>
                </ol>
                <h4>Role of DAO</h4>
                <ol type="1" start="6">
                    <li>Augmint operates as Digital Autonomous Organisation (DAO).</li>
                    <li>Operation of the DAO is fully transparent.</li>
                    <li>
                        The primary role of the DAO is to ensure the stability of each Augmint digital token by managing
                        operations, Augmint reserves, foundation budget, and technical architecture.
                    </li>
                    <li>
                        The Stakeholder must endeavour to prevent any party to monopolise decision making, and should
                        aim to gradually delegate its own decision-making power to decentralised algorithms.
                    </li>
                    <li>
                        Augmint DAO is supervised by Augmint Stability Board (ASB) - members of which are elected by
                        Augmint stakeholders.
                    </li>
                </ol>
                <h4>Stakeholder community</h4>
                <ol type="1" start="11">
                    <li>
                        Stakeholders hold the power to vote in Augmint matters, to practice control over the DAO and
                        participate in decision making.
                    </li>
                    <li>
                        Open governance structure – anyone can join at any time, incumbent users have no particular
                        precedence.
                    </li>
                    <li>Free earnings from the Augmint systems are to be distributed among the Stakeholders.</li>
                </ol>
            </div>
        );
    }
}
