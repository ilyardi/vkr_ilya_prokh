import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import styles from './styles';

import { Spin } from 'antd';

class Preloader extends Component {
  render() {
    const { loading, children } = this.props;

    // if (loaded) {
    //   return children;
    // }

    return (
      <Spin spinning={loading} size="large">
        {children}
      </Spin>
    );
  }
}

// Preloader.propTypes = {
//   classes: PropTypes.object.isRequired
// };

export default withStyles(styles)(Preloader);
