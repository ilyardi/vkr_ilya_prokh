import { LOGIN, LOGOUT } from 'redux/constants';

export const login = (payload) =>
  ({
    type: LOGIN,
    payload,
  });

export const logout = () => {
  return {
    type: LOGOUT,
  };
};
