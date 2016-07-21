import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { account } from './account';
import { location } from './location';

const rootReducer = combineReducers({
  account,
  location,
  routing
});

export default rootReducer;
