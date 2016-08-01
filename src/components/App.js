import React, { PropTypes, Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
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
        type: 'name',
        name: 'Charlotte, NC'
      });
    });
  }

  render() {
    return (
      <Grid id="app-main" fluid style={{ paddingLeft: 0 }}>
        <Row style={{ height: '100%' }}>
          <Col md={9} style={{ height: '100%' }}>
            <Map />
          </Col>
          <Col md={3} style={{ height: '100%', overflow: 'auto' }}>
            {this.props.children}
          </Col>
        </Row>
      </Grid>
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
