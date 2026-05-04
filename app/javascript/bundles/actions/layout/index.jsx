import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Layout as LayoutAntd } from 'antd';
import { Can } from 'tools/ability';

import Sidebar from 'actions/layout/sidebar';
import Header from 'actions/layout/header';
import Payments from 'actions/payments';
import AsteriskCalls from 'actions/asterisk_calls';
import Calls from 'actions/calls';
import CallsReport from 'actions/calls/report';
import CallsRequestDynamic from 'actions/calls/request-dynamic';
import PaymentsReport from 'actions/payments/report';
import ConnectionSource from 'actions/reports/connection_source';
import Saldo from 'actions/saldo';
import Materials from 'actions/materials';
import Equipment from 'actions/equipment';
import EquipmentCreate from 'actions/equipment/new';
import EquipmentUpdate from 'actions/equipment/update';
import EquipmentTypes from 'actions/equipment_types';
import EquipmentTypeCreate from 'actions/equipment_types/new';
import EquipmentTypeUpdate from 'actions/equipment_types/update';
import Agreements from 'actions/agreements';
import FeePayments from 'actions/reports/fee_payments';
import Cameras from 'actions/cameras';
import PhoneConfirmations from 'actions/phone_confirmations';
import SiteRequests from 'actions/site_requests';
import UserRequests from 'actions/user_requests';
import LkPayments from 'actions/lk_payments';
import HelpDesk from 'actions/help_desk';
import WorkSchedules from 'actions/work_schedules';
import TimeSlots from 'actions/time_slots';
import StatisticServiceRequests from 'actions/reports/statistic_service_requests';
import ManagerSales from 'actions/reports/manager_sales';
import ConversionTimeSlots from 'actions/reports/conversion_time_slots';
import Debtors from 'actions/debtors';
import Projects from 'actions/projects';
import ManagmentUsers from 'actions/administration/managment_users';
import BlockingServices from 'actions/blocking_services';
import AutoPaymentMethods from 'actions/auto_payment_methods';
import ExpenseManager from 'actions/expense_manager';
import WhiteIpList from 'actions/white_ip_list';
import TeledomRequest from 'actions/teledom_requests';
import TeledomReports from 'actions/teledom_reports';
import AvailableServices from 'actions/available_services';
import AgreementDocuments from 'actions/agreement_documents';
import Articles from 'actions/articles';


const { Content } = LayoutAntd;

class Layout extends Component {
  render() {
    const { match, history } = this.props;

    const CanRoute = ({ component, ...props }) => (
      <Can I="read" a={props.entity}>
        <Route {...props} component={component} />
      </Can>
    );
    return (
      <LayoutAntd style={{ minHeight: '100vh' }}>
        <Sidebar history={history} handleDrawerClose={this.handleDrawerClose} />
        <LayoutAntd className="site-layout">
          <Header />
          <ToastContainer
            position="bottom-center"
            autoClose={1500}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
          />
          {/* <LayoutAntd style={{ padding: '0 24px 24px' }}> */}
          <Content style={{ margin: '0 16px' }}>
            <Switch>
              <CanRoute entity="Payment" path={`${match.url}`} exact component={Payments} />
              <CanRoute entity="Payment" path={`${match.url}payments`} exact component={Payments} />
              <CanRoute
                entity="LbPayment"
                path={`${match.url}payments/report`}
                exact
                component={PaymentsReport}
              />
              <CanRoute entity="Call" path={`${match.url}calls`} exact component={Calls} />
              <CanRoute
                entity="Call"
                path={`${match.url}calls/report`}
                exact
                component={CallsReport}
              />
              <CanRoute
                entity="Call"
                path={`${match.url}calls/request_dynamic`}
                exact
                component={CallsRequestDynamic}
              />
              <CanRoute
                entity="AsteriskCall"
                path={`${match.url}asterisk_calls`}
                exact
                component={AsteriskCalls}
              />
              <CanRoute
                entity="ConnectionSource"
                path={`${match.url}reports/connection_source`}
                exact
                component={ConnectionSource}
              />
              <CanRoute entity="Reports" path={`${match.url}saldo`} exact component={Saldo} />
              <CanRoute
                entity="Equipment"
                path={`${match.url}equipment`}
                exact
                component={Equipment}
              />
              <CanRoute
                entity="Equipment"
                path={`${match.url}equipment/new`}
                exact
                component={EquipmentCreate}
              />
              <CanRoute
                entity="Equipment"
                path={`${match.url}equipment/:id`}
                exact
                component={EquipmentUpdate}
              />
              <CanRoute
                entity="EquipmentType"
                path={`${match.url}equipment_types`}
                exact
                component={EquipmentTypes}
              />
              <CanRoute
                entity="EquipmentType"
                path={`${match.url}equipment_types/new`}
                exact
                component={EquipmentTypeCreate}
              />
              <CanRoute
                entity="EquipmentType"
                path={`${match.url}equipment_types/:id`}
                exact
                component={EquipmentTypeUpdate}
              />
              <CanRoute
                entity="WarehouseMaterial"
                path={`${match.url}materials`}
                exact
                component={Materials}
              />
              <CanRoute entity="Camera" path={`${match.url}cameras`} exact component={Cameras} />
              <CanRoute
                entity="FeePaymentsReport"
                path={`${match.url}agreements/fee_payments_report`}
                exact
                component={FeePayments}
              />
              <CanRoute
                entity="PhoneConfirmation"
                path={`${match.url}phone_confirmations`}
                exact
                component={PhoneConfirmations}
              />
              <CanRoute
                entity="SiteRequest"
                path={`${match.url}site_requests`}
                exact
                component={SiteRequests}
              />
              <CanRoute
                entity="UserRequest"
                path={`${match.url}user_requests`}
                exact
                component={UserRequests}
              />
              <Can I="read" a="LbAgreements" path={'/agreements'}>
                <Route path={'/agreements'} component={Agreements} />
              </Can>
              <Can I="read" a="LkPayment" path={'/lk_payments'}>
                <Route path={'/lk_payments'} component={LkPayments} />
              </Can>
              <Can I="read" a="HelpDesk" path={'/help_desk'}>
                <Route path={'/help_desk'} component={HelpDesk} />
              </Can>
              <Can I="read" a="WorkingDay" path={'/work_schedules'}>
                <Route path={'/work_schedules'} component={WorkSchedules} />
              </Can>
              <Can I="read" a="TimeSlot" path={'/time_slots'}>
                <Route path={'/time_slots'} component={TimeSlots} />
              </Can>
              <Can I="read" a="StatisticServiceRequests" path={'/reports/statistic_service_requests'}>
                <Route path={'/reports/statistic_service_requests'} component={StatisticServiceRequests} />
              </Can>
              <Can I="read" a="ManagerSales" path={'/reports/manager_sales'}>
                <Route path={'/reports/manager_sales'} component={ManagerSales} />
              </Can>
              <Can I="read" a="ConversionTimeSlots" path={'/reports/conversion_time_slots'}>
                <Route path={'/reports/conversion_time_slots'} component={ConversionTimeSlots} />
              </Can>
              <Can I="read" a="Debtor" path={'/reports/debtors'}>
                <Route path={'/reports/debtors'} component={Debtors} />
              </Can>
              <Can I="read" a="Project" path={'/projects'}>
                <Route path={'/projects'} component={Projects} />
              </Can>
              <Can I="read" a="ManagmentUsers" path={'/managment_users'}>
                <Route path={'/managment_users'} component={ManagmentUsers} />
              </Can>
              <Can I="read" a="BlockingServices" path={'/blocking_services'}>
                <Route path={'/blocking_services'} component={BlockingServices} />
              </Can>
              <Can I="read" a="AutoPaymentMethod" path={'/auto_payment_methods'}>
                <Route path={'/auto_payment_methods'} component={AutoPaymentMethods} />
              </Can>\
              <Can I="read" a="Expense" path={'/expense_manager'}>
                <Route path={'/expense_manager'} component={ExpenseManager} />
              </Can>
              <Can I="read" a="WhiteIpAddress" path={'/white_ip_list'}>
                <Route path={'/white_ip_list'} component={WhiteIpList} />
              </Can>
              <Can I="read" a="TeledomRequest" path={'/teledom_requests'}>
                <Route path={'/teledom_requests'} component={TeledomRequest} />
              </Can>
              <Can I="read" a="TeledomReport" path={'/teledom/reports'}>
                <Route path={'/teledom/reports'} component={TeledomReports} />
              </Can>
              <Can I="read" a="AvailableService" path={'/available_services'}>
                <Route path={'/available_services'} component={AvailableServices} />
              </Can>
              <Can I="read" a="AgreementDocument" path={'/agreement_documents'}>
                <Route path={'/agreement_documents'} component={AgreementDocuments} />
              </Can>
              <Can I="read" a="SiteManagment" path={'/articles'}>
                <Route path={'/articles'} component={Articles} />
              </Can>
            </Switch>
          </Content>



          {/* </LayoutAntd> */}
        </LayoutAntd>
      </LayoutAntd>
    );
  }
}

// Layout.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, null)(Layout);
