import React, { useState, useEffect, useContext } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { Can } from 'tools/ability';
import { Layout as LayoutAntd } from 'antd';
import { Popup, SafeArea } from 'antd-mobile'
import queryString from "query-string";

import Header from './header';
import TimeSlotsPersonal from 'actions/time_slots_personal';
import MobileExpenses from 'actions/mobile_expenses';
import MobileExpenseCard from 'components/mobile_expense_card';
import MobileRequests from 'actions/mobile_requests';
import MobileRequestsCard from 'components/mobile_request_card';
import MobileAgreements from 'actions/mobile_agreements';
import MobileAgreementCard from 'components/mobile_agreement_card';
import Sidebar from './sidebar';

const {
  Content,
  Sider,
  Footer,
} = LayoutAntd;

const CanRoute = ({ component, ...props }) => (
    <Can I={props.i} a={props.entity}>
        <Route {...props} component={component} />
    </Can>
);

const MobileLayout = (props) => {
  // const [mobile, setMobile] = useState(window.clientInformation.appVersion.includes("iPhone") || window.clientInformation.appVersion.includes("Android"));
  const [visibleMenu, setVisibleMenu] = useState(false);
  const { match, history, classes } = props;

  useEffect(() => {
  }, []);

  const openMenu = () => {
    setVisibleMenu(true)
  };

  const handleCloseMenu = () => {
    setVisibleMenu(false)
  };

  return (
    // Не трогать, в работе
    <LayoutAntd style={{
      height: '100vh',
      position: 'relative',
    }}>
      <LayoutAntd.Header style={{
        backgroundColor: '#CDA5E6',
        height: '8%',
        padding: '0px'
      }}>
        <Header openMenu={openMenu}/>
        <Sidebar
          closeMenu={handleCloseMenu}
          visibleMenu={visibleMenu}
        />
      </LayoutAntd.Header>
      <Content style={{
        height: '84%',
      }}>
        <Switch>
          <CanRoute
            i="read"
            entity="TimeSlot"
            path={`${match.url}/time_slots`}
            exact
            component={TimeSlotsPersonal}
          />
          <CanRoute
            i="read"
            entity="LbAgreements"
            path={`${match.url}/agreements`}
            exact
            component={MobileAgreements}
          />
          <CanRoute
            i="update"
            entity="LbAgreements"
            path={`${match.url}/agreements/:agreements_id`}
            exact
            component={MobileAgreementCard}
          />
          <CanRoute
            i="read"
            entity="Expense"
            path={`${match.url}/expenses`}
            exact
            component={MobileExpenses}
          />
          <CanRoute
            i="update"
            entity="Expense"
            path={`${match.url}/expenses/create`}
            exact
            component={MobileExpenseCard}
          />
          <CanRoute
            i="update"
            entity="Expense"
            path={`${match.url}/expenses/:expense_id`}
            exact
            component={MobileExpenseCard}
          />
          <CanRoute
            i="read"
            entity="HelpDesk"
            path={`${match.url}/requests`}
            exact
            component={MobileRequests}
          />
          <CanRoute
            i="update"
            entity="HelpDesk"
            path={`${match.url}/requests/create`}
            exact
            component={MobileRequestsCard}
          />
          <CanRoute
            i="update"
            entity="HelpDesk"
            path={`${match.url}/requests/:request_id`}
            exact
            component={MobileRequestsCard}
          />
          <Redirect from="/" to={`${match.url}/expenses`} />
        </Switch>
      </Content>
      <Footer style={{
        // position: 'absolute',
        // bottom: '0px',
        backgroundColor: '#CDA5E6',
        height: '8%',
        width: '100%',
        padding: '0'
      }}></Footer>
    </LayoutAntd>
    // <LayoutAntd
    //   style={{ height: '100%' }}
    // >
    //   <LayoutAntd className={classes.mobile_layout}>
    //     <Header openMenu={openMenu}/>
    //     <Sidebar
    //       closeMenu={handleCloseMenu}
    //       visibleMenu={visibleMenu}
    //     />
    //     <Content>
    //       <Switch>
    //         <CanRoute
    //           i="read"
    //           entity="TimeSlot"
    //           path={`${match.url}/time_slots`}
    //           exact
    //           component={TimeSlotsPersonal}
    //         />
    //         <CanRoute
    //           i="read"
    //           entity="Expense"
    //           path={`${match.url}/expenses`}
    //           exact
    //           component={MobileExpenses}
    //         />
    //         <CanRoute
    //           i="update"
    //           entity="Expense"
    //           path={`${match.url}/expenses/create`}
    //           exact
    //           component={MobileExpenseCard}
    //         />
    //         <CanRoute
    //           i="update"
    //           entity="Expense"
    //           path={`${match.url}/expenses/:expense_id`}
    //           exact
    //           component={MobileExpenseCard}
    //         />
    //         <CanRoute
    //           i="read"
    //           entity="HelpDesk"
    //           path={`${match.url}/requests`}
    //           exact
    //           component={MobileRequests}
    //         />
    //         <CanRoute
    //           i="update"
    //           entity="HelpDesk"
    //           path={`${match.url}/requests/create`}
    //           exact
    //           component={MobileRequestsCard}
    //         />
    //         <CanRoute
    //           i="update"
    //           entity="HelpDesk"
    //           path={`${match.url}/requests/:request_id`}
    //           exact
    //           component={MobileRequestsCard}
    //         />
    //         <Redirect from="/" to={`${match.url}/expenses`} />
    //       </Switch>
    //     </Content>
    //   </LayoutAntd>
    // </LayoutAntd>
  );
};

const styles = (theme) => ({
  mobile_layout: {
    // background: "linear-gradient(180deg, #FFFFFF 0%, #CDA5E6 100%)",
    backgroundColor: "#CDA5E6"
  },
});

const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(MobileLayout));
