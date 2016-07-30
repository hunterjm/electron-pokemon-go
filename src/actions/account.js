import { getApi } from '../utils/ApiUtil';

export const SAVE_ACCOUNT = 'SAVE_ACCOUNT';
export const LOGIN = 'LOGIN';
export const GET_PROFILE = 'GET_PROFILE';
export const GET_JOURNAL = 'GET_JOURNAL';

export function saveAccount(username, password, provider) {
  return { type: SAVE_ACCOUNT, account: { username, password, provider } };
}

export function login(username, password, location, provider) {
  return async dispatch => {
    try {
      const apiClient = getApi();
      await apiClient.initAsync(username, password, location, provider);
      dispatch(saveAccount(username, password, provider));
      dispatch({ type: LOGIN, status: { loggedIn: true } });
    } catch (e) {
      dispatch({ type: LOGIN, status: { loggedIn: false, message: e.message } });
    }
  };
}

export function getProfile() {
  return async dispatch => {
    const apiClient = getApi();
    try {
      const profile = await apiClient.GetProfileAsync();
      dispatch({ type: GET_PROFILE, status: { success: true }, profile });
    } catch (e) {
      dispatch({ type: GET_PROFILE, status: { success: false, message: e.message } });
    }
    try {
      const journal = await apiClient.GetJournalAsync();
      dispatch({ type: GET_JOURNAL, status: { success: true }, journal });
    } catch (e) {
      dispatch({ type: GET_JOURNAL, status: { success: false, message: e.message } });
    }
  };
}
