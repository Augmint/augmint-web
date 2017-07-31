import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import ethBase from './ethBase'
import rates from './rates'
import tokenUcd from './tokenUcd'
import loanManager from './loanManager'

export default combineReducers({
  routing: routerReducer,
  ethBase,
  rates,
  tokenUcd,
  loanManager
})
