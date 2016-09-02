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
    const statsClass = this.context.router.isActive('/player/profile') ? 'active' : '';
    const inventoryClass = this.context.router.isActive('/player/inventory') ? 'active' : '';
    const journalClass = this.context.router.isActive('/player/journal') ? 'active' : '';
    return (
      <div className="form-section">
        <h1>{username}</h1>
        <hr />
        <ul className={'nav nav-pills'}>
          <li role="presentation" className={statsClass}><Link to={'/player'}>Stats</Link></li>
          <li role="presentation" className={inventoryClass}><Link to={'/player/inventory'}>Pokemon</Link></li>
          <li role="presentation" className={journalClass}><Link to={'/player/journal'}>Journal</Link></li>
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
