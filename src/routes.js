import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import App from './components/App';
import Account from './components/Account';
import Player from './components/Player';
import Profile from './components/Profile';
import Inventory from './components/Inventory';
import Journal from './components/Journal';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Account} />
    <Route path="/player" component={Player}>
      <IndexRedirect to="/player/profile" />
      <Route path="/player/profile" component={Profile} />
      <Route path="/player/inventory" component={Inventory} />
      <Route path="/player/journal" component={Journal} />
    </Route>
  </Route>
);
