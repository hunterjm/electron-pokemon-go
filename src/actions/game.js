import { getApi } from '../utils/ApiUtil';

export const HEARTBEAT = 'HEARTBEAT';

export function heartbeat() {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const data = await apiClient.HeartbeatAsync();
      dispatch({ type: HEARTBEAT, status: { success: true }, data });
    } catch (e) {
      dispatch({ type: HEARTBEAT, status: { success: false, message: e.message } });
    }
  };
}
