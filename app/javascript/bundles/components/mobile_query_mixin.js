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

export class QueryMixin extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  // ------------------------------
  // Методы для работы с URL и state
  // ------------------------------
  getLocation = () => {
    return this.props.location;
  };

  // Для мобильной версии — аналог getParam
  getParam = (name) => {
    const { state, search } = this.getLocation();
    const queryParams = queryString.parse(search);

    if (queryParams[name]) {
      return queryParams[name];
    }

    if (state && state[name]) {
      return state[name];
    }

    if ((this.defaultState || {})[camelizedString(name)]) {
      return this.defaultState[camelizedString(name)];
    }

    return '';
  };

  // Универсальный getQuery (как в ПК)
  getQuery = (name) => {
    return this.getParam(name);
  };

  // Для мобильной версии — аналог setParams
  setParams = (state) => {
    this.props.history.replace({
      pathname: this.props.location.pathname,
      state: state,
      search: queryStringGenerator(state),
    });
  };

  // Универсальный setQuery (как в ПК)
  setQuery = (state) => {
    this.setParams(state);
  };

  // ------------------------------
  // Методы для работы с пагинацией / проверка per page
  // ------------------------------
  checkPerPage = (perPage, rowsPerPageOptions) => {
    return rowsPerPageOptions.includes(parseInt(perPage, 10));
  };

  getPerPage = (per, values) => {
    return values.includes(parseInt(per, 10)) ? per : this.defaultState?.per_page;
  };
}

export default QueryMixin;
