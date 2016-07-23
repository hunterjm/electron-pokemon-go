import React, { PropTypes, Component } from 'react';

class PokemonInfo extends Component {
  render() {
    const fort = this.props.fort;
    const type = fort.type ? 'PokeStop' : 'Gym';
    const info = [];
    if (fort.type) {
      if (fort.lure) {
        const now = new Date().getTime();
        let min = Math.floor((fort.lure.expires - now) / 60 / 1000).toString();
        let sec = Math.floor(((fort.lure.expires - now) / 1000) - 60 * min).toString();
        const pad = '00';
        min = pad.substring(0, pad.length - min.length) + min;
        sec = pad.substring(0, pad.length - sec.length) + sec;
        info.push((<div>Lure By: {fort.lure.deployer}</div>));
        info.push((<div>Expires in {min}:{sec}</div>));
      } else {
        info.push((<small>No Lure</small>));
      }
    } else {
      let team;
      switch (fort.team) {
        case 1:
          team = 'Mystic';
          break;
        case 2:
          team = 'Valor';
          break;
        case 3:
          team = 'Instinct';
          break;
        default:
          team = 'Unoccupied';
      }
      info.push((<div>Team: {team}</div>));
      info.push((<div>Reputation: {fort.reputation || 0}</div>));
      info.push((<div>Gym Leader: {fort.pokemon.name}</div>));
      if (fort.inBattle) {
        info.push((<div><small>In Battle</small></div>));
      }
    }
    return (
      <div>
        <strong>{type}</strong>
        <div>{info}</div>
      </div>
    );
  }
}

PokemonInfo.propTypes = {
  fort: PropTypes.object.isRequired
};

export default PokemonInfo;
