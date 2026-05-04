import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { isEqual, replace as _replace } from 'lodash';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import dayjs from 'dayjs';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Paper,
  TablePagination,
} from '@material-ui/core';

import { FloatButton, DatePicker, Button, Row, Col } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import Preloader from 'components/preloader';
import { itemRender } from 'components/breadcrumb';

import CallsMenu from './components/calls_menu';
import CallRow from './components/row';
import Rest from 'tools/rest';

class Calls extends Component {
  state = {
    loading: false,
    calls: [],
    meta: {},
    filter: {
      created_at: [],
    },
  };

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Звонки', '')
  }

  componentDidMount() {
    document.title += ' | Звонки'
    this.loadCalls(1);
  }

  handleChangePage = (e, page) => {
    this.loadCalls(page + 1);
  };

  handleChangeRowsPerPage = (e) => {
    this.loadCalls(this.state.meta.page, e.target.value);
  };

  handleFilter = (name) => (event) => {
    this.setState({
      filter: {
        ...this.state.filter,
        [name]: event.target.value,
      },
    });
  };

  handleDateFilter = (name) => (dates) => {
    this.setState({
      filter: {
        ...this.state.filter,
        [name]: dates.map((d) => {
          return d ? d.format('DD.MM.YYYY') : null;
        }),
      },
    });
  };

  loadCalls = (page, per = this.state.meta.per) => {
    let params = {
      page: page,
      per: per,
      filter: this.state.filter,
    };
    this.setState({ loading: true });
    Rest.get('/api/v1/calls.json', { params: params }).then((response) => {
      const { calls, meta } = response.data;
      this.setState({ calls, meta, loading: false });
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!isEqual(prevState.filter, this.state.filter)) {
      this.loadCalls(1);
    }
  };

  render() {
    const { classes } = this.props;
    const { calls, filter } = this.state;

    const routes = [
      {
        path: '/calls',
        name: 'Звонки',
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
          extra={CallsMenu}
        >
          <Row gutter={24}>
            <Col>
              <DatePicker.RangePicker
                format={'DD.MM.YYYY'}
                value={filter.created_at.map((d) => {
                  return d ? dayjs(d, 'DD.MM.YYYY') : null;
                })}
                onChange={this.handleDateFilter('created_at')}
              />
            </Col>
          </Row>
        </PageHeader>

        <Preloader loading={this.state.loading}>
          <Paper>
            <Table className={classes.table} padding="checkbox">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell className={classes.nowrap}>Клиент</TableCell>
                  <TableCell className={classes.nowrap}>Менеджер</TableCell>
                  <TableCell>Причина</TableCell>
                  <TableCell className={classes.nowrap}>Время звонка</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((p) => {
                  return <CallRow key={p.id} call={p} classes={classes} />;
                })}
              </TableBody>
              {this.state.meta.page && (
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      colSpan={9}
                      count={this.state.meta.total}
                      rowsPerPage={this.state.meta.per}
                      page={this.state.meta.page - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    // ActionsComponent={TablePaginationActionsWrapped}
                    />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </Paper>
        </Preloader>
      </Fragment>
    );
  }
}

Calls.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({});

export default withStyles(styles)(Calls);
