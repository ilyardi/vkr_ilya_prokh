import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";

class AuthorizedRoute extends Component {
  render() {
    const { component: Component, user, ...rest } = this.props;

    return (
      <Route
        {...rest}
        render={props => {
          return user ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          );
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(AuthorizedRoute);
