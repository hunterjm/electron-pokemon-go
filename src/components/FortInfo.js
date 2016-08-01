import React, { PropTypes, Component } from 'react';

let countdown;

class FortInfo extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      counter: 0,
      loading: false
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.fort.spun && this.state.loading) {
      setTimeout(() => { this.props.getJournal(); }, 1000);
      this.setState({ loading: false });
    }
  }
  componentWillUnmount() {
    clearInterval(countdown);
    countdown = null;
  }
  spinFort() {
    this.setState({ loading: true });
    this.props.spinFort(this.props.fort.id, this.props.fort.latitude, this.props.fort.longitude);
  }
  render() {
    const fort = this.props.fort;
    const type = fort.type ? 'PokeStop' : 'Gym';
    let info;
    let actions;
    if (fort.type) {
      const now = new Date().getTime();
      let min;
      let sec;
      if (fort.lure) {
        min = Math.floor((fort.lure.expires - now) / 60 / 1000).toString();
        sec = Math.floor(((fort.lure.expires - now) / 1000) - 60 * min).toString();
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
      if (this.props.nearby && !this.state.loading) {
        if (fort.cooldown > now) {
          min = Math.floor((fort.cooldown - now) / 60 / 1000).toString();
          sec = Math.floor(((fort.cooldown - now) / 1000) - 60 * min).toString();
          const pad = '00';
          min = pad.substring(0, pad.length - min.length) + min;
          sec = pad.substring(0, pad.length - sec.length) + sec;
          actions = (<div><small>Cooldown finished in {min}:{sec}</small></div>);
        } else {
          actions = (<div><button onClick={() => this.spinFort()}>Get Items</button></div>);
        }
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
        {actions}
      </div>
    );
  }
}

FortInfo.propTypes = {
  fort: PropTypes.object.isRequired,
  nearby: PropTypes.bool.isRequired,
  fortDetails: PropTypes.func.isRequired,
  spinFort: PropTypes.func.isRequired,
  getJournal: PropTypes.func.isRequired
};

export default FortInfo;
