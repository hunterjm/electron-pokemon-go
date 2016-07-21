import React, { PropTypes, Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { default as canUseDOM } from 'can-use-dom';
import Map from './Map';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as LocationActions from '../actions/location';

const geolocation = (canUseDOM && navigator.geolocation);

class App extends Component {
  componentDidMount() {
    geolocation.getCurrentPosition((position) => {
      this.props.setLocation({
        type: 'coords',
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
    }, () => {
      this.props.setLocation({
        type: 'name',
        name: 'Times Square'
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
