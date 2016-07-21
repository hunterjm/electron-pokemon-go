import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import Map from './components/Map';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Map} />
  </Route>
);
