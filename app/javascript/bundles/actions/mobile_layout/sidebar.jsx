import React, { useState, useEffect, useContext } from 'react';
import Rest from 'tools/rest';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract } from '@fortawesome/free-solid-svg-icons';
import { UserOutlined, DollarOutlined, FieldTimeOutlined, LogoutOutlined, ScheduleOutlined } from '@ant-design/icons';
import { AbilityContext, Can } from 'tools/ability';
import { ConfigProvider, Layout, Menu, Col, Row } from 'antd'
import { Popup, List } from 'antd-mobile'

import { logout } from 'redux/actions/user';

const Sidebar = (props) => {
  const { classes, match } = props;
  const context = useContext(AbilityContext);

  const handleLogout = () => {
    Rest.delete('/users/sign_out.json').then(() => {
      props.Logout();
    });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#8f00ff82',
            itemSelectedColor: '#FFFFFF',
            itemColor: '#FFFFFF',
            itemHeight: '60px'
          },
        },
      }}
    >
      <Popup
        visible={props.visibleMenu}
        onMaskClick={props.closeMenu}
        onClose={props.closeMenu}
        position='left'
        bodyStyle={{
          height: '100vh',
          backgroundColor: 'inherit'
        }}
      >
        <div className={classes.sider}>
          <div className={classes.logo}>
            <img src="/images/mobile_logo.png" alt="Телесеть CRM" height={'45px'}/>
          </div>
          <Menu
            mode="inline"
            style={{ borderRight: 0, backgroundColor: 'inherit' }}
            onClick={() => { props.closeMenu() }}
          >
            <Menu.Item
              key="profile"
              className={classes.textItem}
              icon={<UserOutlined style={{fontSize: '24px'}}/>}
            >
              <Link to="/m/profile">Профиль</Link>
            </Menu.Item>
            {context.can('read', 'LbAgreements') && (
              <Menu.Item
                key="agreements"
                className={classes.textItem}
                icon={<FontAwesomeIcon icon={faFileContract}  style={{fontSize: '24px'}}/>}
              >
                <Link to="/m/agreements">Договоры</Link>
              </Menu.Item>
            )}
            {context.can('read', 'Expense') && (
              <Menu.Item
                key="expenses"
                className={classes.textItem}
                icon={<DollarOutlined style={{fontSize: '24px'}}/>}
              >
                <Link to="/m/expenses">Расходы</Link>
              </Menu.Item>
            )}
            {context.can('read', 'HelpDesk') && (
              <Menu.Item
                key="requests"
                className={classes.textItem}
                icon={<ScheduleOutlined style={{ fontSize: '24px' }} />}
              >
                <Link to="/m/requests">Задачи</Link>
              </Menu.Item>
            )}
            {context.can('read', 'TimeSlot') && (
              <Menu.Item
                key="time_slots"
                className={classes.textItem}
                icon={<FieldTimeOutlined style={{fontSize: '24px'}}/>}
              >
                <Link to="/m/time_slots">Слоты</Link>
              </Menu.Item>
            )}
            <Menu.Item
              key="logout"
              className={classes.textItem}
              icon={<LogoutOutlined style={{fontSize: '24px'}}/>
              }
              onClick={handleLogout}
            >
              Выход
            </Menu.Item>
          </Menu>
        </div>
      </Popup>
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  sider: {
    backgroundColor: '#59049b',
    height: '100%',
    width: '260px',
    borderRadius: '0 20px 20px 0',
  },
  logo: {
    padding: '21px',
  },
  textItem: {
    fontSize: '24px'
  },
});

const mapStateToProps = (state) => ({
    user: state.user,
});

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
  )(withStyles(styles)(Sidebar));
