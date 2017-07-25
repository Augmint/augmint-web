import React from 'react';
import {render} from 'react-dom';
require('../index.html'); // for index.html hot reload
import {Bootstrap, Button, ButtonToolbar, PageHeader, Grid, Row, Col} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
var Eth = require('web3-eth');

// TODO: add react-hot-loader: https://gaearon.github.io/react-hot-loader/getstarted/
function PageWrapper(props) {
    return (
        <div className="PageWrapper">
            <PageHeader>
                US Crypto Dollar <small>Proof of Concept playground</small>
            </PageHeader>
            {props.children}
        </div>
    );
}


class App extends React.Component {

    async componentDidMount() {
      console.log('GrandChild did mount.');
      console.log(Eth.givenProvider);
      var eth = new Eth(Eth.givenProvider || "ws://localhost:8545");
      console.log(eth);
    }

    render () {
        return (
            <PageWrapper>
                <div>
                    <p>Hello UCD!</p>
                </div>
            </PageWrapper>
        );
    }
}

render(<App/>, document.getElementById('app'));
