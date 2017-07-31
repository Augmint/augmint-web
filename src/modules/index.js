import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import counter from './counter'
import ethBase from './ethBase'
import rates from './rates'

export default combineReducers({
  routing: routerReducer,
  counter,
  ethBase,
  rates
})
