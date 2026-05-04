import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  Avatar, Button, CssBaseline, FormControl, FormControlLabel, Checkbox,
  Input, InputLabel, Paper, Typography
} from '@material-ui/core';
import LockIcon from '@material-ui/icons/LockOutlined';
import withStyles from '@material-ui/core/styles/withStyles';
import styles from './styles';

import { login } from 'redux/actions/user';
import Rest from 'tools/rest';

class Login extends Component {
  state = {
    redirectToReferrer: false,
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { email, password, remember_me } = this.state;

    Rest.post('/users/sign_in.json', { user: { email, password, remember_me } })
      .then(json => {
        this.setState({ redirectToReferrer: true });
        this.props.Login(json.data);
      })
      .catch(e => {
        console.error(e);
      });
  }

  render() {
    const { classes, user } = this.props;
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (this.state.redirectToReferrer || user) return <Redirect to={from} />;

    return (
      <React.Fragment>
        <CssBaseline />
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>

            <form className={classes.form} onSubmit={this.handleSubmit}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="email">Email Address</InputLabel>
                <Input id="email" name="email" autoComplete="email" autoFocus onChange={this.handleChange} />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                  name="password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={this.handleChange}
                />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" onChange={(e) => {
                  this.setState({
                    remember_me: e.target.checked ? true : undefined,
                  });
                }} />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"

                className={classes.submit}
              >
                Sign in
              </Button>
            </form>
          </Paper>
        </main>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state =>
({
  user: state.user,
});

const mapDispatchToProps = dispatch =>
({
  Login(payload) {
    dispatch(login(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Login));

