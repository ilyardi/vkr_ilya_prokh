import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import { Button, Layout, Typography, Dropdown, Menu, Modal, Affix } from 'antd';
import { MenuOutlined, UserOutlined } from '@ant-design/icons';
import { logout } from 'redux/actions/user';
import Rest from 'tools/rest';
import UserCard from 'components/user_card';
import './header.css'

const { Header: HeaderAntd } = Layout;
const { Text } = Typography

class Header extends Component {
  state = {
    settingsVisible: this.props.user.pass_is_old,
    visibaleCard: true,
  }
  handleLogout = () => {
    Rest.delete('/users/sign_out.json').then(() => {
      this.props.Logout();
    });
  };

  handleOpenSettings = () => {
    this.setState({ settingsVisible: true })
  };

  render() {
    const { classes, user } = this.props;
    const {visibaleCard} = this.state
    const auth = !!user;

    return (
      <HeaderAntd className={classes.header} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {/* {visibaleCard && user.role != 'engineer' &&
          <Affix style={{ position: 'absolute', top: 80, left: '30%', zIndex: 1, width: '800px' }}>
            <img onClick={()=>{this.setState({visibaleCard: false})}} src="/images/march_v2.png" alt="Сердце CRM" style={{width: '100%'}}/>
          </Affix>
        } */}
        {this.state.settingsVisible &&
          <Modal
            visible={this.state.settingsVisible}
            title={"Настройки аккаунта"}
            onCancel={() => { this.setState({ settingsVisible: false }) }}
            onOk={() => { this.setState({ settingsVisible: false }) }}
            footer={false}
            width={'40%'}
          >
            <UserCard user_id={user.id}/>
          </Modal>
        }
        <Text style={{
          // color: "rgb(43, 71, 139)",
          color: 'white',
          margin: 'auto 10px auto 0',
          fontWeight: '500',
          }}>{user.short_name}</Text>
        {auth && (
          <Menu
            mode="horizontal"
            className={classes.menu}
            title='test'
          >
            <Menu.SubMenu title={<UserOutlined style={{fontSize: '25px', color: 'white'}}/>} key="1">
              <Menu.Item key="2">{user.email}</Menu.Item>
              <Menu.Item key="3" onClick={this.handleOpenSettings}>Настройки</Menu.Item>
              <Menu.Item key="4" onClick={this.handleLogout}>
                Выход
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        )}
      </HeaderAntd>
    );
  }
}

const styles = (theme) => ({
  header: {
    padding: 0,
    // backgroundColor: '#ED7F6E',
    // backgroundColor: '#dec3be',
    // backgroundColor: '#f9b001',
    backgroundColor: '#1e3a8a',
  },
  menu: {
    // backgroundColor: '#ED7F6E',
    // backgroundColor: '#dec3be',
    backgroundColor: '#1e3a8a',
    height: '100%',
    float: 'right',
    // color: 'rgb(43, 71, 139)',
    color: 'white',
  },
});

const mapStateToProps = (state) => {
  return { user: state.user };
};

const mapDispatchToProps = (dispatch) => {
  return {
    Logout(payload) {
      dispatch(logout(payload));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(withSnackbar(Header)));
