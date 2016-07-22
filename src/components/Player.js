import React, { PropTypes, Component } from 'react';
import { PageHeader } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AccountActions from '../actions/account';
import * as GameActions from '../actions/game';

let heartbeatTimer;

class Player extends Component {
  componentWillMount() {
    this.props.getProfile();
  }

  componentDidMount() {
    this.props.heartbeat();
    heartbeatTimer = setInterval(this.props.heartbeat, 30000);
  }

  shouldComponentUpdate(nextProps) {
    return (nextProps.account.profile !== this.props.account.profile
      || nextProps.game.heartbeat !== this.props.game.heartbeat);
  }

  componentWillUnmount() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }
  }

  render() {
    let username;
    let stats;
    if (this.props.account.profile) {
      username = (<small>{this.props.account.profile.username}</small>);
    }
    return (
      <div className="form-section">
        <PageHeader>Profile {username}</PageHeader>
        <div>
          {stats}
        </div>
      </div>
    );
  }
}

Player.propTypes = {
  getProfile: PropTypes.func.isRequired,
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
    location: state.location
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...AccountActions, ...GameActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);
