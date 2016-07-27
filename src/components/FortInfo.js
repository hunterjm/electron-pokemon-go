import React, { PropTypes, Component } from 'react';

let countdown;

class FortInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      counter: 0
    };
  }
  componentDidMount() {
    if (!this.props.fort.name) {
      // Get fort details
      this.props.fortDetails(this.props.fort.id, this.props.fort.latitude, this.props.fort.longitude);
    }
    countdown = setInterval(() => {
      this.setState({ counter: 1 });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(countdown);
    countdown = null;
  }
  render() {
    const fort = this.props.fort;
    const type = fort.type ? 'PokeStop' : 'Gym';
    let info;
    if (fort.type) {
      if (fort.lure) {
        const now = new Date().getTime();
        let min = Math.floor((fort.lure.expires - now) / 60 / 1000).toString();
        let sec = Math.floor(((fort.lure.expires - now) / 1000) - 60 * min).toString();
        const pad = '00';
        min = pad.substring(0, pad.length - min.length) + min;
        sec = pad.substring(0, pad.length - sec.length) + sec;
        info = (
          <span>
            <div>Lure Expires in {min}:{sec}</div>
            <div><small>Current Pokemon: {fort.lure.pokemon.name}</small></div>
          </span>
        );
      } else {
        info = (<small>No Lure</small>);
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
      info = (
        <span>
          <div>Team: {team}</div>
          <div>Reputation: {fort.reputation || 0}</div>
          <div>Gym Leader: {fort.pokemon.name}</div>
          {fort.inBattle ? <div><small>In Battle</small></div> : null}
        </span>
      );
    }
    return (
      <div>
        <strong>{fort.name || type}</strong>
        <div>{fort.description}</div>
        <div>{info}</div>
      </div>
    );
  }
}

FortInfo.propTypes = {
  fort: PropTypes.object.isRequired,
  fortDetails: PropTypes.func.isRequired,
  spinFort: PropTypes.func.isRequired
};

export default FortInfo;
