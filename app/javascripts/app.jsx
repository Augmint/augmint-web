import React from 'react';
import {render} from 'react-dom';
require('../index.html');
// TODO: add react-hot-loader: https://gaearon.github.io/react-hot-loader/getstarted/

class App extends React.Component {
  render () {
    return (
      <div>
        <p>Hello UCD!</p>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
