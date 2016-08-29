import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AccountActions from '../actions/account';

class Profile extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.account.profile !== this.props.account.profile;
  }

  render() {
    const profile = this.props.account.profile;
    if (profile) {
      const lvlProgress = profile.experience / profile.next_level_xp * 100;
      return (
        <div style={{ textAlign: 'center' }}>
          <img src={`team${parseInt(profile.team, 10) || 0}.png`} width={100} height={100} />
          <div><small>{profile.experience} XP</small></div>
          <h3 style={{ marginTop: '-4px' }}>Level {profile.level}</h3>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={lvlProgress}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: `${lvlProgress}%` }}
            >
              <span className="sr-only">{lvlProgress}% Complete</span>
            </div>
          </div>
          <div style={{ marginTop: '-10px' }}>{profile.experience} / {profile.next_level_xp} XP</div>
        </div>
      );
    }
    return <div>Loading...</div>;
  }
}

Profile.propTypes = {
  account: PropTypes.object.isRequired,
  game: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

Profile.contextTypes = {
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
  return bindActionCreators({ ...AccountActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
