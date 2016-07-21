import React, { Component, PropTypes } from 'react';
import { Grid, Row, Col, PageHeader } from 'react-bootstrap';

class App extends Component {
  render() {
    return (
      <Grid id="app-main" fluid style={{ paddingLeft: 0 }}>
        <Row style={{ height: '100%' }}>
          <Col md={9} style={{ height: '100%' }}>
            {this.props.children}
          </Col>
          <Col md={3}>
            <PageHeader>Login</PageHeader>
          </Col>
        </Row>
      </Grid>
    );
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired
};

export default App;
