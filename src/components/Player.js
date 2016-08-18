import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

class Player extends Component {
  render() {
    const account = this.props.account;
    const username = account && account.profile && account.profile.username || 'Profile';
    return (
      <div className="form-section">
        <h1>{username}</h1>
        <hr />
        <ul className={'nav nav-pills'}>
          <li role="presentation" className={'active'}><Link to={'/profile'}>Stats</Link></li>
          <li role="presentation"><Link to={'/profile/journal'}>Journal</Link></li>
          <li role="presentation"><Link to={'/profile/pokemon'}>Pokemon</Link></li>
        </ul>
        {this.props.children}
      </div>
    );
  }
}

Player.propTypes = {
  children: PropTypes.element.isRequired,
  account: PropTypes.object.isRequired
};

Player.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    account: state.account
  };
}

export default connect(mapStateToProps)(Player);
