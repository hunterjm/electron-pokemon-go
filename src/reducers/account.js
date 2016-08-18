import { SAVE_ACCOUNT, LOGIN, GET_PROFILE, GET_JOURNAL } from '../actions/account';
import { saveAccount, loadAccount } from '../utils/ApiUtil';
import { isEmpty } from 'lodash';

export function account(state = {}, action) {
  let nextState;
  switch (action.type) {
    case LOGIN:
      nextState = Object.assign({}, state, action.status);
      return nextState;
    case GET_PROFILE: {
      const profile = Object.assign({}, state.profile, action.profile);
      nextState = Object.assign({}, state, { profile });
      return nextState;
    }
    case GET_JOURNAL:
      nextState = Object.assign({}, state, { journal: action.journal || {} });
      return nextState;
    case SAVE_ACCOUNT:
      nextState = Object.assign({}, state, {
        username: action.account.username,
        password: action.account.password,
        provider: action.account.provider
      });
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
