import { SET_LOCATION, HEARTBEAT, FORT_DETAILS, SPIN_FORT } from '../actions/game';
import { UPDATE_INVENTORY } from '../actions/account';
import { findIndex } from 'lodash';

const initialState = {
  location: {},
  nearbyForts: [],
  nearbyPokemon: []
};

export default function game(state = initialState, action) {
  let nextState;
  switch (action.type) {
    case SET_LOCATION:
      return Object.assign({}, state, { location: action.location });
    case HEARTBEAT: {
      if (action.status.success) {
        let nearbyPokemon = Object.assign([], state.nearbyPokemon);
        const nearbyForts = Object.assign([], state.nearbyForts);
        if (action.hb.map_cells.length !== 25) {
          console.warn('Response from API does not contain all s2Cells sent');
        }
        for (const cell of action.hb.map_cells) {
          for (const mp of cell.catchable_pokemons) {
            const pokemon = { ...action.pokemonlist[mp.pokemon_id - 1] };
            pokemon.id = mp.encounter_id;
            pokemon.catchable = true;
            pokemon.latitude = mp.latitude;
            pokemon.longitude = mp.longitude;
            pokemon.expires = parseInt(mp.expiration_timestamp_ms, 10);
            const i = findIndex(nearbyPokemon, { id: pokemon.id });
            if (i !== -1) {
              nearbyPokemon[i] = Object.assign({}, nearbyPokemon[i], pokemon);
            } else {
              nearbyPokemon.push(pokemon);
            }
          }
          for (const wp of cell.wild_pokemons) {
            if (parseInt(wp.time_till_hidden_ms, 10) < 0) continue;
            const pokemon = { ...action.pokemonlist[parseInt(wp.pokemon_data.pokemon_id, 10) - 1] };
            pokemon.id = parseInt(wp.encounter_id, 10);
            pokemon.catchable = false;
            pokemon.latitude = wp.latitude;
            pokemon.longitude = wp.longitude;
            pokemon.expires = Date.now() + parseInt(wp.time_till_hidden_ms, 10);
            const i = findIndex(nearbyPokemon, { id: pokemon.id });
            if (i !== -1) {
              nearbyPokemon[i] = Object.assign({}, nearbyPokemon[i], pokemon);
            } else {
              nearbyPokemon.push(pokemon);
            }
          }
          for (const ft of cell.forts) {
            const fort = {
              id: ft.id,
              type: ft.type,
              team: ft.owned_by_team,
              latitude: ft.latitude,
              longitude: ft.longitude,
              pokemon: ft.guard_pokemon_id && { ...action.pokemonlist[parseInt(ft.guard_pokemon_id, 10) - 1] } || null,
              reputation: ft.gym_points && parseInt(ft.gym_points, 10) || null,
              enabled: ft.enabled,
              cooldown: parseInt(ft.cooldown_complete_timestamp_ms, 10),
              inBattle: ft.is_in_battle || 0,
              lure: null
            };
            if (ft.lure_info) {
              const pId = ft.lure_info.active_pokemon_id;
              fort.lure = {
                pokemon: pId && { ...action.pokemonlist[parseInt(pId, 10) - 1] } || null,
                expires: parseInt(ft.lure_info.lure_expires_timestamp_ms, 10)
              };
            }
            const i = findIndex(nearbyForts, { id: fort.id });
            if (i !== -1) {
              nearbyForts[i] = Object.assign({}, nearbyForts[i], fort);
            } else {
              nearbyForts.push(fort);
            }
          }
        }
        nearbyPokemon = nearbyPokemon.reduce((p, c) => {
          if (Date.now() < c.expires) {
            p.push(c);
          }
          return p;
        }, []);
        nextState = Object.assign({}, state, { nearbyPokemon, nearbyForts });
      } else {
        nextState = Object.assign({}, state, { error: action.status.message });
      }
      return nextState;
    }
    case UPDATE_INVENTORY:
      return Object.assign({}, state, {
        inventory: { pokemon: action.pokemon, eggs: action.eggs, incubators: action.incubators }
      });
    case FORT_DETAILS: {
      if (action.status.success) {
        const nearbyForts = Object.assign([], state.nearbyForts);
        const i = findIndex(nearbyForts, { id: action.result.fort_id });
        if (i !== -1) {
          nearbyForts[i] = Object.assign({}, nearbyForts[i], {
            name: action.result.name,
            description: action.result.description,
            images: action.result.image_urls
          });
          nextState = Object.assign({}, state, { nearbyForts });
        }
      } else {
        nextState = Object.assign({}, state, { error: action.status.message });
      }
      return nextState;
    }
    case SPIN_FORT: {
      if (action.status.success) {
        const nearbyForts = Object.assign([], state.nearbyForts);
        const i = findIndex(nearbyForts, { id: action.result.id });
        nearbyForts[i] = Object.assign({}, nearbyForts[i], action.result);
        nextState = Object.assign({}, state, { nearbyForts });
      } else {
        nextState = Object.assign({}, state, { error: action.status.message });
      }
      return nextState;
    }
    default:
      return state;
  }
}
