import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import account from './account';
import game from './game';
import settings from './settings';

const rootReducer = combineReducers({
  account,
  game,
  settings,
  routing
});

export default rootReducer;
