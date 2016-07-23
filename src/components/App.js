import React, { PropTypes, Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
// import { default as canUseDOM } from 'can-use-dom';
import Map from './Map';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LocationActions from '../actions/location';

// const geolocation = (canUseDOM && navigator.geolocation);
let attempts = 0;

class App extends Component {
  componentDidMount() {
    this.getLocation();
  }

  getLocation() {
    const self = this;
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
      if (attempts < 2) {
        attempts++;
        setTimeout(() => self.getLocation(), 500);
      } else {
        this.props.setLocation({
          type: 'coords',
          coords: {
            latitude: 35.006711942342534,
            longitude: -80.84641456604004
          }
        });
      }
    });
  }

  render() {
    return (
      <Grid id="app-main" fluid style={{ paddingLeft: 0 }}>
        <Row style={{ height: '100%' }}>
          <Col md={9} style={{ height: '100%' }}>
            <Map />
          </Col>
          <Col md={3}>
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
    location: state.location
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(LocationActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
