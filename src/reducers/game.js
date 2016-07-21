import { HEARTBEAT } from '../actions/game';

export function game(state = {}, action) {
  let nextState;
  switch (action.type) {
    case HEARTBEAT:
      if (action.status.success) {
        nextState = Object.assign({}, state, { heartbeat: action.data });
      } else {
        nextState = Object.assign({}, state, { heartbeat: { error: action.status.message } });
      }
      return nextState;
    default:
      return state;
  }
}
