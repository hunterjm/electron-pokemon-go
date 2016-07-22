import { HEARTBEAT } from '../actions/game';

export function game(state = {}, action) {
  let nextState;
  switch (action.type) {
    case HEARTBEAT:
      if (action.status.success) {
        const nearbyPokemon = [];
        for (const cell of action.hb.cells) {
          for (const mp of cell.MapPokemon) {
            const pokemon = action.pokemonlist[parseInt(mp.PokedexTypeId, 10) - 1];
            pokemon.latitude = mp.Latitude;
            pokemon.longitude = mp.Longitude;
            pokemon.expires = parseInt(mp.ExpirationTimeMs, 10);
            nearbyPokemon.push(pokemon);
          }
          for (const wp of cell.WildPokemon) {
            const pokemon = action.pokemonlist[parseInt(wp.pokemon.PokemonId, 10) - 1];
            pokemon.latitude = wp.Latitude;
            pokemon.longitude = wp.Longitude;
            pokemon.expires = Date.now() + parseInt(wp.TimeTillHiddenMs, 10);
            nearbyPokemon.push(pokemon);
          }
        }
        nextState = Object.assign({}, state, { nearbyPokemon });
      } else {
        nextState = Object.assign({}, state, { error: action.status.message });
      }
      return nextState;
    default:
      return state;
  }
}
