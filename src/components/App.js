import React, { PropTypes, Component } from 'react';
// import { default as canUseDOM } from 'can-use-dom';
import Map from './Map';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as GameActions from '../actions/game';

class App extends Component {
  componentDidMount() {
    this.getLocation();
  }

  getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.props.setLocation({
        type: 'coords',
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });
    }, (result) => {
      console.error(result);
      this.props.setLocation({
        type: 'coords',
        coords: {
          latitude: 35.2271329,
          longitude: -80.8430872
        }
      });
    });
  }

  render() {
    return (
      <div className={'container-fluid'} id="app-main" style={{ paddingLeft: 0 }}>
        <div className={'row'} style={{ height: '100%' }}>
          <div className={'col-md-9'} style={{ height: '100%' }}>
            <Map />
          </div>
          <div className={'col-md-3'} style={{ height: '100%', overflow: 'auto' }}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
  setLocation: PropTypes.func.isRequired
};

App.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    location: state.game.location || {}
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GameActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
