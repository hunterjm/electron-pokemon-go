import React, { PropTypes, Component } from 'react';

class PokemonInfo extends Component {
  render() {
    const pokemon = this.props.pokemon;
    const now = new Date().getTime();
    let min = Math.floor((pokemon.expires - now) / 60 / 1000).toString();
    let sec = Math.floor(((pokemon.expires - now) / 1000) - 60 * min).toString();
    const pad = '00';
    min = pad.substring(0, pad.length - min.length) + min;
    sec = pad.substring(0, pad.length - sec.length) + sec;
    return (
      <div>
        <strong>{pokemon.name}</strong>
        <div>Expires in {min}:{sec}</div>
      </div>
    );
  }
}

PokemonInfo.propTypes = {
  pokemon: PropTypes.object.isRequired
};

export default PokemonInfo;
