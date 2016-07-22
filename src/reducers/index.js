import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { account } from './account';
import { game } from './game';
import { location } from './location';

const rootReducer = combineReducers({
  account,
  game,
  location,
  routing
});

export default rootReducer;
