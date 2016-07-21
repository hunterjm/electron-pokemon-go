import { SAVE_ACCOUNT } from '../actions/account';
import { saveAccount, loadAccount } from '../utils/ApiUtil';
import { isEmpty } from 'lodash';

export function account(state = {}, action) {
  let nextState;
  switch (action.type) {
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
