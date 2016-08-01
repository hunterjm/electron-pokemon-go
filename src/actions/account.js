import { getApi } from '../utils/ApiUtil';
import _ from 'lodash';

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

export function getJournal() {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const jr = await apiClient.GetJournalAsync();
      if (!jr.log_entries) throw new Error('No log entries');
      const journal = jr.log_entries.map((log) => {
        const action = log.Action;
        const entry = {
          action,
          timestamp: parseInt(log.timestamp_ms, 10)
        };
        if (action === 'catch_pokemon') {
          entry.pokemon = Object.assign(
            {},
            _.find(apiClient.pokemonlist, { id: log.catch_pokemon.pokemon_id.toString() }),
            { cp: log.catch_pokemon.combat_points }
          );
        } else {
          entry.items = [];
          for (const item of log.fort_search.items) {
            entry.items.push(Object.assign(
              {},
              _.find(apiClient.itemlist, { id: item.item_id }),
              { count: item.item_count }
            ));
          }
          if (log.eggs) {
            entry.items.push(Object.assign(
              {},
              _.find(apiClient.itemlist, { id: 0 }),
              { count: log.eggs }
            ));
          }
        }
        return entry;
      });
      journal.sort((a, b) => {
        if (a.timestamp === b.timestamp) return 0;
        return a.timestamp > b.timestamp ? -1 : 1;
      });
      dispatch({ type: GET_JOURNAL, status: { success: true }, journal });
    } catch (e) {
      dispatch({ type: GET_JOURNAL, status: { success: false, message: e.message } });
    }
  };
}

export function getProfile() {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const pr = await apiClient.GetProfileAsync();
      const profile = {
        username: pr.username,
        created: new Date(pr.creation_time),
        team: pr.team,
        avatar: { ...pr.avatar },
        storage: {
          pokemon: pr.poke_storage,
          items: pr.item_storage
        },
        coins: _.find(pr.currency, { type: 'POKECOIN' }).amount,
        stardust: _.find(pr.currency, { type: 'STARDUST' }).amount
      };
      dispatch({ type: GET_PROFILE, status: { success: true }, profile });
    } catch (e) {
      dispatch({ type: GET_PROFILE, status: { success: false, message: e.message } });
    }
  };
}
