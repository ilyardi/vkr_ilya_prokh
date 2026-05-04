import React, { Component } from "react";
import { Route, BrowserRouter, Switch } from "react-router-dom";
// import { connect } from 'react-redux';
import Login from "actions/devise/login";
import AuthorizedRoute from "routing/authorized_route";
import Layout from "actions/layout";
import MobileLayout from "actions/mobile_layout";

class Routing extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <AuthorizedRoute path="/m" component={MobileLayout} />
          <AuthorizedRoute path="/" component={Layout} />
        </Switch>
      </BrowserRouter>
    );
  }
}

// const mapStateToProps = state => ({ user: state.user })

// export default connect(mapStateToProps)(Routing);

export default Routing;
