import { Component } from 'react';
import queryString from 'query-string';

const camelizedString = (str) => {
  return str.replace(/(_\w)/g, (m) => m[1].toUpperCase());
};

const queryStringGenerator = (params) => {
  return (
    '?' +
    queryString.stringify(params, { arrayFormat: 'bracket', skipNull: true, skipEmptyString: true })
  );
};

class QueryMixin extends Component {
  getLocation = () => {
    return this.props.location;
  };

  getQuery = (name) => {
    const { state, search } = this.getLocation();
    const queryParams = queryString.parse(search);

    if (state && state[name]) {
      return state[name];
    }

    if (queryParams[name]) {
      return queryParams[name];
    }

    if ((this.defaultState || {})[camelizedString(name)]) {
      return this.defaultState[camelizedString(name)];
    }

    return '';
  };

  setQuery = (state) => {
    this.props.history.replace({
      pathname: this.props.location.pathname,
      state: state,
      search: queryStringGenerator(state),
    });
  };

  // checkPerPage = (perPage, rowsPerPageOptions) => {
  //   return rowsPerPageOptions.includes(parseInt(perPage));
  // };

  // getPerPage = (per, values) => {
  //   return values.includes(parseInt(per, 10)) ? per : this.defaultState.per_page;
  // };
}

export default QueryMixin;
