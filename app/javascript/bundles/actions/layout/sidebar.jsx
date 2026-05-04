import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AbilityContext } from 'tools/ability';
import { Layout, Menu } from 'antd';
import { withStyles } from '@material-ui/core/styles';
import { faChartBar, faChartPie, faFileContract, faList, faUsers } from '@fortawesome/free-solid-svg-icons';
import {
  ScheduleOutlined,
  FieldTimeOutlined,
  DisconnectOutlined,
  UserOutlined,
  ToolOutlined,
  LockOutlined,
  DollarOutlined,
  BarChartOutlined,
  SlidersOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;
const { Sider } = Layout;

class Sidebar extends Component {
  state = {
    reports: {
      open: false,
    },
    warehouse: {
      open: false,
    },
  };

  isActive = (path) => {
    return path === this.props.history.location.pathname;
  };
  handleReportsOpening = () => {
    const { reports } = this.state;
    this.setState({
      reports: {
        open: !reports.open,
      },
    });
  };

  handleWarehouseOpening = () => {
    const { warehouse } = this.state;
    this.setState({
      warehouse: {
        open: !warehouse.open,
      },
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <Sider collapsible className={classes.sider}>
        <div className={classes.logo}>
        </div>
        <Menu mode="inline" style={{ height: '100%', borderRight: 0, color: 'rgb(43, 71, 139)' }}>
          {/* {this.context.can('read', 'Administration') && (
            <SubMenu
              icon={<ToolOutlined />}
              title="Администрирование"
              key="administration"
            >
              {this.context.can('read', 'ManagmentUsers') && (
                <Menu.Item key="/managment_users" icon={<UserOutlined />}>
                  <Link to="/managment_users">Пользователи</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'AvailableService') && (
                <Menu.Item key="/available_services" icon={<SlidersOutlined />}>
                  <Link to="/available_services">Доступные услуги</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )} */}
          {/*{this.context.can('read', 'Reports') && (
            <SubMenu
              icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon={faChartBar} />}
              title="Отчеты"
              key="reports"
            >
              {this.context.can('read', 'FeePaymentsReport') && (
                <Menu.Item
                  key="/agreements/fee_payments_report"
                  icon={<FontAwesomeIcon icon={faFileContract} />}
                >
                  <Link to="/agreements/fee_payments_report">Начисления</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'StatisticServiceRequests') && (
                <Menu.Item
                  key="/reports/statistic_service_requests"
                  icon={<FontAwesomeIcon icon={faFileContract} />}
                >
                  <Link to="/reports/statistic_service_requests">Сервис стат</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'ManagerSales') && (
                <Menu.Item
                  key="/reports/manager_sales"
                  icon={<FontAwesomeIcon icon={faFileContract} />}
                >
                  <Link to="/reports/manager_sales">Продажи</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'ConversionTimeSlots') && (
                <Menu.Item
                  key="/reports/conversion_time_slots"
                  icon={<FontAwesomeIcon icon={faFileContract} />}
                >
                  <Link to="/reports/conversion_time_slots">Конверсия слотов</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'Call') && (
                <Menu.Item key="/calls" icon={<FontAwesomeIcon icon="hands-helping" />}>
                  <Link to="/calls">Обращения</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'AsteriskCall') && (
                <Menu.Item key="/asterisk_calls" icon={<FontAwesomeIcon icon="phone-square" />}>
                  <Link to="/asterisk_calls">Звонки</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )} */}
          {/* {this.context.can('read', 'Teledom') && (
            <SubMenu
              icon={<ToolOutlined />}
              title="Телесеть.Дом"
              key="teledom"
            >
              {this.context.can('read', 'TeledomRequest') && (
                <Menu.Item key="/teledom_requests" icon={<UserOutlined />}>
                  <Link to="/teledom_requests">Заявки</Link>
                </Menu.Item>
              )}

              {this.context.can('read', 'TeledomReport') && (
                <Menu.Item key="/teledom/reports" icon={<BarChartOutlined />}>
                  <Link to="/teledom/reports">Отчеты</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )} */}
          {/* {this.context.can('read', 'ConnectionSource') && (
            <Menu.Item key="/reports/connection_source" icon={<FontAwesomeIcon icon="link" />}>
              <Link to="/reports/connection_source">Подключение</Link>
            </Menu.Item>
          )} */}
          {/* {this.context.can('read', 'Billing') && (
            <SubMenu
              icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon="table" />}
              title="Бухгалтерия"
              key="buh"
            >
              {this.context.can('read', 'Payment') && (
                <Menu.Item key="/payments" icon={<FontAwesomeIcon icon="money-bill" />}>
                  <Link to="/payments">Загружаемые платежи</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'LbPayment') && (
                <Menu.Item key="/payments/report" icon={<FontAwesomeIcon icon="money-bill" />}>
                  <Link to="/payments/report">Все платежи</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'Saldo') && (
                <Menu.Item key="/saldo" icon={<FontAwesomeIcon icon="ad" />}>
                  <Link to="/saldo">Сальдо</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )} */}
          {/* {this.context.can('read', 'Warehouse') && (
            <SubMenu
              icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon="warehouse" />}
              title="Склад"
              key="warehouse"
            >
              {this.context.can('read', 'Equipment') && (
                <Menu.Item key="equipment" icon={<FontAwesomeIcon icon="industry" />}>
                  <Link to="/equipment">Оборудование</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'EquipmentType') && (
                <Menu.Item key="equipment_types" icon={<FontAwesomeIcon icon="boxes" />}>
                  <Link to="/equipment_types">Тип оборудования</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'WarehouseMaterial') && (
                <Menu.Item key="materials" icon={<FontAwesomeIcon icon="th" />}>
                  <Link to="/materials">Материалы</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )} */}
          {this.context.can('read', 'LbAgreements') && (
            <Menu.Item key="/agreements" icon={<FontAwesomeIcon icon={faFileContract} />}>
              <Link to="/agreements">Договоры</Link>
            </Menu.Item>
          )}
          {/* {this.context.can('read', 'Expense') && (
            <Menu.Item key="/expense_manager" icon={<DollarOutlined />}>
              <Link to="/expense_manager">Расходы</Link>
            </Menu.Item>
          )} */}
          {this.context.can('read', 'Debtor') && (
            <Menu.Item key="/reports/debtors" icon={<DisconnectOutlined />}>
              <Link to="/reports/debtors">Должники</Link>
            </Menu.Item>
          )}
          {/* {this.context.can('read', 'Camera') && (
            <Menu.Item key="/cameras" icon={<FontAwesomeIcon icon="camera" />}>
              <Link to="/cameras">Камеры</Link>
            </Menu.Item>
          )} */}
          {this.context.can('read', 'Project') && (
            <Menu.Item key="/projects" icon={<FontAwesomeIcon icon={faList} />}>
              <Link to="/projects">Проекты</Link>
            </Menu.Item>
          )}
          {this.context.can('read', 'HelpDesk') && (
            <Menu.Item key="/help_desk" icon={<FontAwesomeIcon icon={faList} />}>
              <Link to="/help_desk">Задачи</Link>
            </Menu.Item>
          )}
          {/* {this.context.can('read', 'BlockingServices') && (
            <Menu.Item key="/blocking_services" icon={<LockOutlined />}>
              <Link to="/blocking_services">Блокировки</Link>
            </Menu.Item>
          )} */}
          {this.context.can('read', 'WorkingDay') && (
            <Menu.Item key="/work_schedules" icon={<ScheduleOutlined />}>
              <Link to="/work_schedules">Рабочий график</Link>
            </Menu.Item>
          )}
          {this.context.can('read', 'TimeSlot') && (
            <Menu.Item key="/time_slots" icon={<FieldTimeOutlined />}>
              <Link to="/time_slots">Временные слоты</Link>
            </Menu.Item>
          )}
          
          {/*{this.context.can('read', 'SiteManagment') && (
            <SubMenu
              icon={<FontAwesomeIcon style={{ marginRight: 10 }} icon="globe" />}
              title="Сайт"
              key="lk"
            >
              {this.context.can('read', 'AutoPaymentMethod') && (
                <Menu.Item key="auto_payment_methods" icon={<DollarOutlined />} >
                  <Link to="/auto_payment_methods">Автоплатежи ЛК</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'PhoneConfirmation') && (
                <Menu.Item key="phone_confirmations" icon={<FontAwesomeIcon icon="sms" />}>
                  <Link to="/phone_confirmations">СМС уведом.</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'LkPayment') && (
                <Menu.Item key="lk_payments" icon={<FontAwesomeIcon icon="money-bill" />}>
                  <Link to="/lk_payments">Платежи ЛК</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'SiteRequest') && (
                <Menu.Item key="site_requests" icon={<FontAwesomeIcon icon="envelope" />}>
                  <Link to="/site_requests">Поддержка</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'UserRequest') && (
                <Menu.Item key="user_requests" icon={<FontAwesomeIcon icon="envelope" />}>
                  <Link to="/user_requests">Подключение</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'AgreementDocument') && (
                <Menu.Item key="agreement_documents" icon={<FilePdfOutlined />}>
                  <Link to="/agreement_documents">Документы</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'Article') && (
                <Menu.Item key="articles" icon={<FontAwesomeIcon icon="newspaper" />}>
                  <Link to="/articles">Новости</Link>
                </Menu.Item>
              )}
              {this.context.can('read', 'Document') && (
                <Menu.Item key="documents" icon={<FontAwesomeIcon icon="file-pdf" />}>
                  <Link to="/documents">Документы</Link>
                </Menu.Item>
              )}
            </SubMenu>
          )} */}
          {/*{this.context.can('read', 'WhiteIpAddress') && (
            <Menu.Item key="/white_ip_list" icon={<DisconnectOutlined />}>
              <Link to="/white_ip_list">Белые IP</Link>
            </Menu.Item>
          )} */}
        </Menu>
      </Sider>
    );
  }
}

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

Sidebar.contextType = AbilityContext;

const styles = (theme) => ({
  sider: {
    // background: '#fff',
    // overflow: 'auto',
    // height: '100vh',
    // position: 'fixed',
    // left: 0,
    // backgroundColor: '#59049b',
    // backgroundColor: '#dec3be',
    backgroundColor: '#f9b001',
    color: 'rgb(43, 71, 139)',
  },
  logo: {
    height: '64px',
    // margin: '16px',
    textAlign: 'left',
  },
});

export default withStyles(styles)(Sidebar);
