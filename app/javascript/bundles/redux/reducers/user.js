import { LOGIN, LOGOUT } from 'redux/constants';
import { ability } from 'tools/ability';

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
  case LOGOUT:
    return null;
  case LOGIN:
    ability.update(action.payload.ability);
    return {
      ...state,
      ...action.payload,
    };
  default:
    return state;
  }
};
