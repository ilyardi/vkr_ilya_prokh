import React, { Component, Fragment } from "react";
import {
  isEqual as _isEqual,
  groupBy as _groupBy,
  keys as _keys
} from "lodash";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import dayjs from 'dayjs';
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
} from "@material-ui/core";

import { FloatButton, DatePicker, Select, Row, Col, Radio } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';

import CallsMenu from "./components/calls_menu";
import Preloader from "components/preloader";
import { itemRender } from "components/breadcrumb";

import Rest from "tools/rest";

class CallsRequestDynamic extends Component {
  state = {
    loading: false,
    report: {},
    calls: [],
    manager_groups: [],
    meta: {},
    order: "desc",
    orderBy: null,
    filter: {
      created_at: [dayjs(new Date()).format('DD.MM.YYYY'), dayjs(new Date()).format('DD.MM.YYYY')],
      manager_group: "all",
      group: 'hour',
    },
  };

  componentDidMount() {
    this.load();
  }

  load = () => {
    const { filter } = this.state;

    Rest.get("/api/v1/calls/request_dynamic.json", {
      params: { filter: filter }
    }).then(response => {
      const { calls, manager_groups } = response.data;
      manager_groups.unshift({ person_id: "all", fio: "Все" });
      this.setState({ calls, manager_groups });
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const filterChanged = !_isEqual(prevState.filter, this.state.filter);

    if (filterChanged) {
      this.load();
    }
  };

  handleRequestSort = property => event => {
    const orderBy = property;
    let order = "desc";

    this.setState({ order, orderBy });
  };

  handleFilter = (event, v) => {
    this.setState({
      filter: {...this.state.filter, [event.target.name]: event.target.value}
    });
  };

  handleSelectFilter = (name) => (value, _) => {
    this.setState({
      filter: { ...this.state.filter, [name]: value }
    });
  };

  handleDateFilter = name => dates => {
    this.setState({
      filter: { ...this.state.filter, [name]: dates.map((d) => { return d ? d.format('DD.MM.YYYY') : null; }), }
    });
  };

  render() {
    const { calls, manager_groups, filter } = this.state;

    const routes = [
      {
        path: '/calls',
        name: 'Звонки',
      },
      {
        path: '/calls/request_dynamic',
        name: 'Динамика запросов',
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
            <Col span={4}>
              <Select defaultValue={filter.manager_group} style={{ width: 200 }} onChange={this.handleSelectFilter('manager_group')}>
                {manager_groups.map(group => (
                  <Select.Option key={group.person_id} value={group.person_id}>{group.fio}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Radio.Group name="group" onChange={this.handleFilter} value={filter.group}>
                <Radio value={'hour'}>По часам</Radio>
                <Radio value={'day'}>По дням</Radio>
              </Radio.Group>
            </Col>
          </Row>
        </PageHeader>

        <Preloader loading={this.state.loading}>
          <Paper>
            <ResponsiveContainer width={'100%'} height={500}>
              <AreaChart data={calls}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickFormatter={(item) => {
                  const format = filter.group === 'hour' ? 'HH:mm' : 'DD.MM.YYYY'
                  return dayjs.unix(item).format(format);
                }}/>
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip labelFormatter={(v) => {
                  const format = filter.group === 'hour' ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY'
                  return dayjs.unix(v).format(format);
                }}/>
                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Preloader>
      </Fragment>
    );
  }
}

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  },
});

CallsRequestDynamic.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CallsRequestDynamic);
