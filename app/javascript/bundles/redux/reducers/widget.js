import { WIDGET_SEARCH_HISTORY_ADD, WIDGET_SEARCH_HISTORY_UPDATE,
  WIDGET_MANAGER_PHONE_UPDATE } from 'redux/constants';
import _findIndex from 'lodash/findIndex';

const initialState = {
  history: [],
  manager_phone: null,
}

export default (state = initialState, payload) => {
  let index;

  switch (payload.type) {
    case WIDGET_SEARCH_HISTORY_ADD:
      var _history = state.history.slice(0);

      if (payload.account.uid) {
        index = _findIndex(state.history, { uid: payload.account.uid });
        if (index !== -1) {
          _history.splice(index, 1);
        }

        _history.unshift(payload.account);
      }

      return {
        ...state,
        history: _history.slice(0, 20),
      }

    case WIDGET_SEARCH_HISTORY_UPDATE:
      var _history = state.history.slice(0);

      index = _findIndex(state.history, { uid: payload.account.uid });
      if (index !== -1) {
        _history[index] = payload.account;
      }

      return {
        ...state,
        history: _history,
      }

    case WIDGET_MANAGER_PHONE_UPDATE:
      return {
        ...state,
        managerPhone: payload.managerPhone,
      }

    default:
      return state;
  }
}
