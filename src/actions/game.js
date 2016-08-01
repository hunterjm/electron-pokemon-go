import { getApi } from '../utils/ApiUtil';

export const SET_LOCATION = 'SET_LOCATION';
export const HEARTBEAT = 'HEARTBEAT';
export const FORT_DETAILS = 'FORT_DETAILS';
export const SPIN_FORT = 'SPIN_FORT';

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

export function heartbeat() {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const hb = await apiClient.HeartbeatAsync();
      dispatch({ type: HEARTBEAT, status: { success: true }, hb, pokemonlist: apiClient.pokemonlist });
    } catch (e) {
      dispatch({ type: HEARTBEAT, status: { success: false, message: e.message } });
    }
  };
}

export function fortDetails(id, lat, lng) {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const result = await apiClient.GetFortDetailsAsync(id, lat, lng);
      dispatch({ type: FORT_DETAILS, status: { success: true }, result });
    } catch (e) {
      dispatch({ type: FORT_DETAILS, status: { success: false, message: e.message } });
    }
  };
}

export function spinFort(id, lat, lng) {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const r = await apiClient.GetFortAsync(id, lat, lng);
      const result = {
        id,
        spun: true,
        cooldown: parseInt(r.cooldown_complete_timestamp_ms, 10)
      };
      dispatch({ type: SPIN_FORT, status: { success: true }, result });
    } catch (e) {
      dispatch({ type: SPIN_FORT, status: { success: false, message: e.message } });
    }
  };
}
