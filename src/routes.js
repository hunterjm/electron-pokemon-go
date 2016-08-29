import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import Account from './components/Account';
import Player from './components/Player';
import Profile from './components/Profile';
import Journal from './components/Journal';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Account} />
    <Route path="/player" component={Player}>
      <IndexRoute component={Profile} />
      <Route path="/player/journal" component={Journal} />
    </Route>
  </Route>
);
