import { SAVE_ACCOUNT, LOGIN, GET_PROFILE } from '../actions/account';
import { saveAccount, loadAccount } from '../utils/ApiUtil';
import { isEmpty } from 'lodash';

export function account(state = {}, action) {
  let nextState;
  switch (action.type) {
    case LOGIN:
      nextState = Object.assign({}, state, action.status);
      return nextState;
    case GET_PROFILE:
      nextState = Object.assign({}, state, { profile: action.profile });
      return nextState;
    case SAVE_ACCOUNT:
      nextState = {
        username: action.account.username,
        password: action.account.password,
        provider: action.account.provider
      };
      saveAccount(nextState);
      return nextState;
    default:
      if (isEmpty(state)) {
        nextState = loadAccount() || {};
      } else {
        nextState = state;
      }
      return nextState;
  }
}
