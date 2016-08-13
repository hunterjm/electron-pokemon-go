import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { account } from './account';
import { game } from './game';

const rootReducer = combineReducers({
  account,
  game,
  routing
});

export default rootReducer;
