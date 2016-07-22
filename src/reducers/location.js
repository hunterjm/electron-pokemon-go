import { SET_LOCATION } from '../actions/location';

export function location(state = {}, action) {
  switch (action.type) {
    case SET_LOCATION:
      return Object.assign({}, state, action.location);
    default:
      return state;
  }
}
