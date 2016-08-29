import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setTimer, clearTimer } from '../utils/ApiUtil';
import { Link } from 'react-router';
import * as GameActions from '../actions/game';

class Player extends Component {
  componentDidMount() {
    setTimer(this.props.heartbeat, 1000);
  }

  componentWillUnmount() {
    clearTimer();
  }

  render() {
    const account = this.props.account;
    const username = account && account.profile && account.profile.username || 'Profile';
    return (
      <div className="form-section">
        <h1>{username}</h1>
        <hr />
        <ul className={'nav nav-pills'}>
          <li role="presentation" className={'active'}><Link to={'/profile'}>Stats</Link></li>
          <li role="presentation"><Link to={'/profile/pokemon'}>Pokemon</Link></li>
          <li role="presentation"><Link to={'/profile/journal'}>Journal</Link></li>
        </ul>
        <hr />
        {this.props.children}
      </div>
    );
  }
}

Player.propTypes = {
  children: PropTypes.element.isRequired,
  account: PropTypes.object.isRequired,
  heartbeat: PropTypes.func.isRequired,
};

Player.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    account: state.account
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...GameActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);
