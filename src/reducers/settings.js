import { UPDATE_SORT_ORDER } from '../actions/settings';

const initialState = {
  sort: 'iv'
};

export default function settings(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SORT_ORDER:
      return Object.assign({}, state, { sort: action.sortOrder });
    default:
      return state;
  }
}
