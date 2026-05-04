import React, { useState, useEffect, useContext } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { withSnackbar } from 'notistack';
import { SafeArea } from 'antd-mobile'

const Header = (props) => {
  const { classes, openMenu } = props;

  return (
    <div className={classes.mobile_header}>
      <MenuOutlined onClick={openMenu} className={classes.menu}/>
    </div>
  );
};

const styles = (theme) => ({
  mobile_header: {
    width: '80px',
    height: '8vh',
    display: 'flex',
    justifyContent: 'space-evenly',
    position: 'absolute',
    left:'0px',
    zIndex: '2',
  },
  menu: {
    fontSize: "30px",
    color: '#59059B',
  },
});

const mapStateToProps = (state) => {
  return { user: state.user };
};

export default connect(
  mapStateToProps,
  null,
)(withStyles(styles)(withSnackbar(Header)));
