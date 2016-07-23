import { HEARTBEAT } from '../actions/game';

export function game(state = {}, action) {
  let nextState;
  switch (action.type) {
    case HEARTBEAT:
      if (action.status.success) {
        let nearbyPokemon = [];
        let nearbyForts = [];
        if (action.hb.cells.length !== 21) {
          console.warn('Response from API does not contain all s2Cells sent');
        }
        for (const cell of action.hb.cells) {
          for (const mp of cell.MapPokemon) {
            const pokemon = { ...action.pokemonlist[parseInt(mp.PokedexTypeId, 10) - 1] };
            pokemon.id = parseInt(mp.EncounterId, 10);
            pokemon.catchable = true;
            pokemon.latitude = mp.Latitude;
            pokemon.longitude = mp.Longitude;
            pokemon.expires = parseInt(mp.ExpirationTimeMs, 10);
          }
          for (const wp of cell.WildPokemon) {
            if (parseInt(wp.TimeTillHiddenMs, 10) < 0) continue;
            const pokemon = { ...action.pokemonlist[parseInt(wp.pokemon.PokemonId, 10) - 1] };
            pokemon.id = parseInt(wp.EncounterId, 10);
            pokemon.catchable = false;
            pokemon.latitude = wp.Latitude;
            pokemon.longitude = wp.Longitude;
            pokemon.expires = Date.now() + parseInt(wp.TimeTillHiddenMs, 10);
            nearbyPokemon.push(pokemon);
          }
          for (const ft of cell.Fort) {
            const fort = {
              id: ft.FortId,
              type: ft.FortType,
              team: ft.Team,
              latitude: ft.Latitude,
              longitude: ft.Longitude,
              pokemon: ft.GuardPokemonId && { ...action.pokemonlist[parseInt(ft.GuardPokemonId, 10) - 1] } || null,
              reputation: ft.GymPoints && parseInt(ft.GymPoints, 10) || null,
              inBattle: ft.IsInBattle || 0,
              lure: null
            };
            if (ft.LureInfo) {
              const pId = ft.LureInfo.ActivePokemonId;
              fort.lure = {
                pokemon: pId && { ...action.pokemonlist[parseInt(pId, 10) - 1] } || null,
                expires: parseInt(ft.LureInfo.LureExpiresTimestampMs, 10),
                deployer: ft.LureInfo.DeployerPlayerCodename
              };
            }
            nearbyForts.push(fort);
          }
        }
        nearbyPokemon = nearbyPokemon.reduce((p, c) => {
          if (p.indexOf(c) < 0) {
            p.push(c);
          }
          return p;
        }, []);
        nearbyForts = nearbyForts.reduce((p, c) => {
          if (p.indexOf(c) < 0) {
            p.push(c);
          }
          return p;
        }, []);
        nextState = Object.assign({}, state, { nearbyPokemon, nearbyForts });
      } else {
        nextState = Object.assign({}, state, { error: action.status.message });
      }
      return nextState;
    default:
      return state;
  }
}
