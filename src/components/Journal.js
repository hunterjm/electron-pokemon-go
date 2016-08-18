import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PokemonLog from './PokemonLog';
import PokestopLog from './PokestopLog';
import { setTimer, clearTimer } from '../utils/ApiUtil';
import * as AccountActions from '../actions/account';
import * as GameActions from '../actions/game';

class Journal extends Component {
  componentWillMount() {
    setTimeout(this.props.getProfile, 500);
    setTimeout(this.props.getJournal, 1500);
  }

  componentDidMount() {
    setTimeout(this.props.heartbeat, 1000);
    setTimer(this.props.heartbeat, 30000);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.account !== this.props.account;
  }

  componentWillUnmount() {
    clearTimer();
  }

  render() {
    const account = this.props.account;
    let contents = [];
    if (account.journal && account.journal.length) {
      contents = contents.concat(account.journal.map((entry, i) => {
        const key = `entry${i}`;
        if (entry.action === 'catch_pokemon') {
          return (<PokemonLog key={key} entry={entry} />);
        }
        return (<PokestopLog key={key} entry={entry} />);
      }));
    }
    return (
      <div className="form-section">
        {contents}
      </div>
    );
  }
}

Journal.propTypes = {
  getProfile: PropTypes.func.isRequired,
  getJournal: PropTypes.func.isRequired,
  heartbeat: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

Journal.contextTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Journal);
