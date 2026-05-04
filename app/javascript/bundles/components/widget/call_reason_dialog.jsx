import React, { Component } from "react";
import { connect } from "react-redux";
import {
  groupBy as _groupBy,
  isEqual as _isEqual,
  chunk as _chunk,
  keys as _keys,
} from "lodash";
import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  AppBar,
  Paper,
} from "@material-ui/core";
import { withSnackbar } from "notistack";

import Rest from "tools/rest";
import { historyUpdate } from "redux/actions/widget";

class CallReasonDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 0,
      callReasons: [],
      account: props.account || {},
    };

    this.loadReasons();
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (!_isEqual(this.props, nextProps)) {
      nextState.account = nextProps.account;
    }
  }

  loadReasons = () => {
    Rest.get("/lbwidget/call_reasons")
      .then((json) => {
        const data = json.data;
        this.setState({ callReasons: data || [] });
      })
      .catch((e) => {
        this.props.enqueueSnackbar(e.message, { variant: "error" });
      });
  };

  handleClose = () => {
    this.props.onClose();
  };

  handleSave = () => {
    const params = {
      call: {
        lb_account_id: this.state.account.uid,
        call_reason_id: this.state.account.call_reason_id,
      },
    };

    Rest.post("/lbwidget/calls", params)
      .then((json) => {
        if (json.data && json.data.success === true) {
          this.props.historyUpdate(this.state.account);
          this.props.enqueueSnackbar("Звонок зафиксирован", {
            variant: "success",
          });
          this.props.onClose();
        } else {
          // console.error(json.data);
          this.props.enqueueSnackbar("Ошибка сохранения", { variant: "error" });
        }
      })
      .catch((e) => {
        this.props.enqueueSnackbar(e.message, { variant: "error" });
      });
  };

  handleChange = (event) => {
    this.setState({
      account: {
        ...this.state.account,
        call_reason_id: event.target.value,
      },
    });
  };

  handleChangeTab = (event, value) => {
    this.setState({ currentTab: value });
  };

  render() {
    const { classes, open } = this.props;
    const { currentTab } = this.state;

    const TabContainer = (props) => (
      <Typography component="div" style={{ padding: 8 * 3, display: "flex" }}>
        {props.children}
      </Typography>
    );

    const callReasons = _groupBy(this.state.callReasons, "group");
    const reasonsGroupNames = _keys(callReasons) || [];
    const reasonsGroupName = reasonsGroupNames[currentTab];
    const tabReasons = callReasons[reasonsGroupName] || [];

    return (
      <Dialog
        onClose={this.handleClose}
        scroll="body"
        open={open}
        fullScreen={true}
      >
        <DialogTitle id="widget-call-reason-dialog">
          Выберите причину обращения
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {this.state.account.name}
          </Typography>
          <Typography variant="caption" gutterBottom>
            {this.state.account.address}
          </Typography>

          <div className={classes.tabs}>
            <AppBar position="static" className={classes.tabsBar}>
              <Tabs value={currentTab} onChange={this.handleChangeTab}>
                {reasonsGroupNames.map((n) => {
                  return <Tab label={n} key={n} />;
                })}
              </Tabs>
            </AppBar>
            <Paper>
              <TabContainer>
                {_chunk(tabReasons, Math.ceil(tabReasons.length / 4)).map(
                  (reasonsPart, idx) => {
                    return (
                      <FormControl
                        component="fieldset"
                        className={classes.formControl}
                        key={idx}
                      >
                        <RadioGroup
                          name="call_reason"
                          className={classes.group}
                          value={this.state.account.call_reason_id}
                          onChange={this.handleChange}
                        >
                          {reasonsPart.map((reason) => {
                            return (
                              <FormControlLabel
                                value={reason.id + ""}
                                control={<Radio />}
                                label={reason.name}
                                key={reason.id}
                              />
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                    );
                  }
                )}
              </TabContainer>
            </Paper>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="secondary">
            Закрыть
          </Button>
          <Button onClick={this.handleSave} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const styles = (theme) => ({
  tabs: {
    // display: 'flex',
    marginTop: theme.spacing(3),
  },
  formControl: {
    margin: theme.spacing(3),
  },
  group: {
    margin: `${theme.spacing(1)}px 0`,
  },
});

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({
  historyUpdate(payload) {
    dispatch(historyUpdate(payload));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withSnackbar(withStyles(styles, { withTheme: true })(CallReasonDialog)));
