import { getApi, pokemonlist } from '../utils/ApiUtil';
import { parseInventory, saveSettings } from './account';
import { Utils } from 'pogobuf';

export const SET_LOCATION = 'SET_LOCATION';
export const HEARTBEAT = 'HEARTBEAT';
export const FORT_DETAILS = 'FORT_DETAILS';
export const SPIN_FORT = 'SPIN_FORT';

export function setLocation(location) {
  if (location.coords) {
    const apiClient = getApi();
    apiClient.setPosition(location.coords.latitude, location.coords.longitude);
    return { type: SET_LOCATION, location };
  }
}

export function heartbeat() {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const cellIDs = Utils.getCellIDs(apiClient.playerLatitude, apiClient.playerLongitude);
      const hb = await apiClient.batchStart()
            .getMapObjects(cellIDs, Array(cellIDs.length).fill(0))
            .getHatchedEggs()
            .getInventory()
            .checkAwardedBadges()
            .downloadSettings()
            .batchCall();
      dispatch({ type: HEARTBEAT, status: { success: true }, hb: hb[0], pokemonlist });
      parseInventory(hb[2], dispatch);
      dispatch(saveSettings(hb[4]));
    } catch (e) {
      dispatch({ type: HEARTBEAT, status: { success: false, message: e.message } });
    }
  };
}

export function fortDetails(id, lat, lng) {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const result = await apiClient.fortDetails(id, lat, lng);
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
      const r = await apiClient.fortSearch(id, lat, lng);
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
