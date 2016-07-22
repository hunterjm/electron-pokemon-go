import { getApi } from '../utils/ApiUtil';

export const SET_LOCATION = 'SET_LOCATION';

export function setLocation(location) {
  const apiClient = getApi();
  return async dispatch => {
    const coords = await apiClient.SetLocationAsync(location);
    let state = location;
    if (location.type === 'name') {
      state = {
        type: 'coords',
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      };
    }
    dispatch({ type: SET_LOCATION, location: state });
  };
}
