import { getApi } from '../utils/ApiUtil';

export const SET_LOCATION = 'SET_LOCATION';

export function setLocation(location) {
  const apiClient = getApi();
  if (apiClient.playerInfo.accessToken) {
    return async dispatch => {
      await apiClient.SetLocationAsync(location);
      dispatch({ type: SET_LOCATION, location });
    };
  }
  return { type: SET_LOCATION, location };
}
