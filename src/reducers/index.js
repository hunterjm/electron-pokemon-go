import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { account } from './account';

const rootReducer = combineReducers({
  account,
  routing
});

export default rootReducer;
