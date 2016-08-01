import React, { PropTypes, Component } from 'react';

class PokemonLog extends Component {
  render() {
    const entry = this.props.entry;
    const pokemon = entry.pokemon;
    const timestamp = new Date(entry.timestamp);
    return (
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid lightgrey', marginBottom: '5px' }}>
        <div style={{ width: '45px', height: '100%' }}>
          <img src={pokemon.img} alt={pokemon.name} width={45} height={45} />
        </div>
        <div>
          <div>{pokemon.name} was caught!</div>
          <div><small>CP {pokemon.cp}</small></div>
          <div><small>{timestamp.toLocaleDateString('en-us')} {timestamp.toLocaleTimeString('en-us')}</small></div>
        </div>
      </div>
    );
  }
}

PokemonLog.propTypes = {
  entry: PropTypes.object.isRequired
};

export default PokemonLog;
