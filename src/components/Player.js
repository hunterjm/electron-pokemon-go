import React, { PropTypes, Component } from 'react';
import { PageHeader } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PokemonLog from './PokemonLog';
import PokestopLog from './PokestopLog';
import { setTimer, clearTimer } from '../Utils/ApiUtil';
import * as AccountActions from '../actions/account';
import * as GameActions from '../actions/game';

class Player extends Component {
  componentWillMount() {
    this.props.getProfile();
    setTimeout(this.props.getJournal, 1000);
  }

  componentDidMount() {
    this.props.heartbeat();
    setTimer(this.props.heartbeat, 30000);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.account !== this.props.account;
  }

  componentWillUnmount() {
    clearTimer();
  }

  render() {
    const username = this.props.account.profile.username || 'Profile';
    let contents = [];
    if (this.props.account.journal && this.props.account.journal.length) {
      contents = contents.concat(this.props.account.journal.map((entry, i) => {
        const key = `entry${i}`;
        if (entry.action === 'catch_pokemon') {
          return (<PokemonLog key={key} entry={entry} />);
        }
        return (<PokestopLog key={key} entry={entry} />);
      }));
    }
    return (
      <div className="form-section">
        <PageHeader>{username}</PageHeader>
        {contents}
      </div>
    );
  }
}

Player.propTypes = {
  getProfile: PropTypes.func.isRequired,
  getJournal: PropTypes.func.isRequired,
  heartbeat: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

Player.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    account: state.account,
    game: state.game,
    location: state.game.location || {}
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AccountActions, ...GameActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);
