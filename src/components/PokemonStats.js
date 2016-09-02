import React, { PropTypes, Component } from 'react';

class PokemonStats extends Component {
  render() {
    const pokemon = this.props.pokemon;
    const ia = pokemon.individual_attack;
    const id = pokemon.individual_defense;
    const is = pokemon.individual_stamina;
    const iv = Math.round((ia + id + is) / 45 * 100);
    return (
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid lightgrey', marginBottom: '5px' }}>
        <div style={{ width: '45px', height: '100%' }}>
          <img src={pokemon.img} alt={pokemon.nickname} width={45} height={45} />
        </div>
        <div style={{ marginLeft: '10px', textAlign: 'center', width: '100%' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid lightgrey' }}>
            <strong>{pokemon.nickname}</strong>
          </div>
          <div style={{ borderBottom: '1px solid lightgrey' }}>
            <div style={{ display: 'inline-block', width: '50%' }}>
              <small>CP {pokemon.cp}</small>
            </div>
            <div
              style={{ display: 'inline-block', width: '50%', borderLeft: '1px solid lightgrey' }}
            >
              <small>HP {pokemon.stamina}/{pokemon.stamina_max}</small>
            </div>
          </div>
          <div>
            <small>IV {iv}% ({ia}/{id}/{is})</small>
          </div>
        </div>
      </div>
    );
  }
}

PokemonStats.propTypes = {
  pokemon: PropTypes.object.isRequired
};

export default PokemonStats;
