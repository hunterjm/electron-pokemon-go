import { login as apiLogin, pokemonlist, itemlist, getApi } from '../utils/ApiUtil';
import _ from 'lodash';

export const SAVE_ACCOUNT = 'SAVE_ACCOUNT';
export const SAVE_SETTINGS = 'SAVE_SETTINGS';
export const LOGIN = 'LOGIN';
export const GET_PROFILE = 'GET_PROFILE';
export const GET_JOURNAL = 'GET_JOURNAL';
export const UPDATE_INVENTORY = 'UPDATE_INVENTORY';

export function getPlayer(player) {
  const profile = {
    username: player.username,
    created: new Date(player.creation_timestamp_ms),
    team: player.team,
    avatar: { ...player.avatar },
    storage: {
      pokemon: player.max_pokemon_storage,
      items: player.max_item_storage
    },
    coins: _.find(player.currencies, { name: 'POKECOIN' }).amount,
    stardust: _.find(player.currencies, { name: 'STARDUST' }).amount
  };
  return { type: GET_PROFILE, status: { success: true }, profile };
}

export function parseInventory(inventory, dispatch) {
  if (inventory.success) {
    const pokemon = [];
    const eggs = [];
    const incubators = [];
    for (const data of inventory.inventory_delta.inventory_items) {
      if (data.inventory_item_data.player_stats) {
        const profile = { ...data.inventory_item_data.player_stats };
        dispatch({ type: GET_PROFILE, status: { success: true }, profile });
      }
      if (data.inventory_item_data.pokemon_data) {
        const item = data.inventory_item_data.pokemon_data;
        if (item.is_egg) {
          eggs.push({ ...item });
        } else {
          const p = {
            ...pokemonlist[item.pokemon_id - 1],
            ...item,
            iv: Math.round((item.individual_attack + item.individual_defense + item.individual_stamina) / 45 * 100),
          };
          p.nickname = p.nickname || p.name;
          pokemon.push(p);
        }
      }
      if (data.inventory_item_data.egg_incubators) {
        for (const incubator of data.inventory_item_data.egg_incubators.egg_incubator) {
          const item = _.find(itemlist, { id: incubator.item_id });
          incubators.push({ ...item, ...incubator });
        }
      }
    }
    dispatch({ type: UPDATE_INVENTORY, pokemon, eggs, incubators });
  }
}

export function saveSettings(result) {
  if (!result.error && result.settings) {
    const settings = Object.assign({}, {
      fort_settings: { ...result.settings.fort_settings },
      map_settings: { ...result.settings.map_settings },
      level_settings: { ...result.settings.level_settings },
      inventory_settings: { ...result.settings.inventory_settings },
      gps_settings: { ...result.settings.gps_settings },
    });
    return { type: SAVE_SETTINGS, settings };
  }
}

export function saveAccount(username, password, provider) {
  return { type: SAVE_ACCOUNT, account: { username, password, provider } };
}

export function login(username, password, location, provider) {
  return async dispatch => {
    try {
      const result = await apiLogin(username, password, provider, location);
      dispatch(saveAccount(username, password, provider));
      dispatch({ type: LOGIN, status: { loggedIn: true } });
      if (result[0].success) {
        dispatch(getPlayer(result[0].player_data));
      }
      parseInventory(result[2], dispatch);
      dispatch(saveSettings(result[4]));
    } catch (e) {
      dispatch({ type: LOGIN, status: { loggedIn: false, message: e.message } });
    }
  };
}

export function getJournal() {
  return async dispatch => {
    try {
      const apiClient = getApi();
      const jr = await apiClient.batchStart()
            .sfidaActionLog()
            .getHatchedEggs()
            .getInventory()
            .checkAwardedBadges()
            .downloadSettings()
            .batchCall();
      if (!jr[0].log_entries) throw new Error('No log entries');
      const journal = jr[0].log_entries.map((log) => {
        const action = log.Action;
        const entry = {
          action,
          timestamp: parseInt(log.timestamp_ms, 10)
        };
        if (action === 'catch_pokemon') {
          entry.pokemon = Object.assign(
            {},
            _.find(pokemonlist, { id: log.catch_pokemon.pokemon_id.toString() }),
            { cp: log.catch_pokemon.combat_points }
          );
        } else {
          entry.items = [];
          for (const item of log.fort_search.items) {
            entry.items.push(Object.assign(
              {},
              _.find(itemlist, { id: item.item_id }),
              { count: item.count }
            ));
          }
          if (log.eggs) {
            entry.items.push(Object.assign(
              {},
              _.find(itemlist, { id: 0 }),
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
      parseInventory(jr[2], dispatch);
      dispatch(saveSettings(jr[4]));
    } catch (e) {
      dispatch({ type: GET_JOURNAL, status: { success: false, message: e.message } });
    }
  };
}
