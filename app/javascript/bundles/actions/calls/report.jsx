import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  isEqual as _isEqual,
  groupBy as _groupBy,
  keys as _keys
} from "lodash";

import dayjs from 'dayjs';

import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Paper,
  Typography,
  Tooltip,
  TableSortLabel
} from "@material-ui/core";

import { FloatButton, DatePicker, Button, Row, Col } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import CallsMenu from "./components/calls_menu";
import Preloader from "components/preloader";
import { itemRender } from "components/breadcrumb";

import Rest from "tools/rest";

class CallsReport extends Component {
  state = {
    report: {},
    months: [],
    meta: {},
    order: "desc",
    orderBy: null,
    filter: {
      created_at: [null, null],
    },
  };

  componentDidMount() {
    this.load();
  }

  load = () => {
    const { orderBy, filter } = this.state;
    this.setState({ loading: true });

    Rest.get("/api/v1/calls/report.json", {
      params: { filter, order_by: orderBy }
    }).then(response => {
      const { report, months, meta } = response.data;
      this.setState({ report, months, meta, loading: false });
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const filterChanged = !_isEqual(prevState.filter, this.state.filter);
    const orderChanged = !_isEqual(prevState.orderBy, this.state.orderBy);

    if (filterChanged || orderChanged) {
      this.load();
    }
  };

  handleRequestSort = property => event => {
    const orderBy = property;
    let order = "desc";

    this.setState({ order, orderBy });
  };

  handleDateFilter = name => dates => {
    this.setState({
      filter: {
        ...this.state.filter,
        [name]: dates.map((d) => { return d ? d.format('DD.MM.YYYY') : null; }),
      }
    });
  };

  render() {
    const { classes } = this.props;
    const { orderBy, order, filter } = this.state;

    const reasons = _keys(this.state.report);

    const routes = [
      {
        path: '/calls',
        name: 'Звонки',
      },
      {
        path: '/calls/reports',
        name: 'Отчет',
      },
    ];

    return (
      <Fragment>
        <FloatButton.BackTop />

        <PageHeader
          breadcrumb={{
            routes,
            itemRender,
          }}
          extra={CallsMenu}>
          <Row gutter={24}>
            <Col span={4}>
              <DatePicker.RangePicker
                format={'DD.MM.YYYY'}
                value={filter.created_at.map((d) => { return d ? dayjs(d, 'DD.MM.YYYY') : null; })}
                onChange={this.handleDateFilter("created_at")}
              />
            </Col>
          </Row>
        </PageHeader>

        <Preloader loading={this.state.loading}>
          <Paper>
            <Table className={classes.table} padding="checkbox">
              <TableHead>
                <TableRow>
                  <TableCell>Причина</TableCell>
                  {this.state.months.map(m => {
                    return (
                      <TableCell
                        colSpan="2"
                        key={m}
                        sortDirection={orderBy === m[0] ? order : false}
                      >
                        <Tooltip
                          title="Sort"
                          placement={"bottom-end"}
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={orderBy === m[0]}
                            direction={order}
                            onClick={this.handleRequestSort(m[0])}
                          >
                            {dayjs.unix(m[0]).format("MMMM YYYY")}
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {reasons.map((r, idx) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell>{r}</TableCell>
                      {this.state.months.map((m, midx) => {
                        const v = this.state.report[r][m[0] + ""];
                        return (
                          <React.Fragment key={midx}>
                            <TableCell>{v && v.count}</TableCell>
                            <TableCell>
                              {v && (
                                <Typography variant="caption">
                                  {v.percent}%
                                </Typography>
                              )}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Итого</TableCell>
                  {this.state.months.map(m => {
                    return (
                      <TableCell colSpan="2" key={m}>
                        {m[1]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        </Preloader>
      </Fragment>
    );
  }
}

CallsReport.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({});

export default withStyles(styles)(CallsReport);
