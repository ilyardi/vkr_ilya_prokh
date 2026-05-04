import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas);

import Routing from 'routing';
import Rest from 'tools/rest';
import { login } from 'redux/actions/user';
import './app.scss';

class App extends Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    Rest.get('/api/v1/profile.json')
      .then((json) => {
        this.props.Login(json.data);
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    return <Fragment>{!this.state.loading && <Routing />}</Fragment>;
  }
}

const mapStateToProps = (state) => {
  return { user: state.user };
};

const mapDispatchToProps = (dispatch) => ({
  Login(payload) {
    dispatch(login(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
