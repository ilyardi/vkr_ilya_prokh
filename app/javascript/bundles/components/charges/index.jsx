import React from 'react';
import Rest from 'tools/rest';
import {
  Table,
  Row,
  Col,
  Form,
  Tag,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import {
  debounce,
  map as _map,
  find as _find,
  forEach as _forEach,
  isEqual,
  filter as _filter,
} from 'lodash';
import Preloader from 'components/preloader';

class Charges extends React.Component {
  state = {
    lb_teleset_charges: [],
    filter: this.props.filter,
    meta: {
      page: 1,
      per: 10,
      total: 0,
      order: 'desc',
      order_by: 'month',
    },
    loading: false,
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.meta.order !== this.state.meta.order ||
      prevState.meta.order_by !== this.state.meta.order_by ||
      !isEqual(prevState.filter, this.state.filter)
    ) {
      this.loadData();
    }
  }

  loadData = () => {
    const {
      meta: { page, per, order, order_by },
      filter,
    } = this.state;
    this.setState({ loading: true });
    let params = { page, per, order, order_by, filter };
    Rest.get('/api/v1/lb_teleset_charges.json', { params: params }).then((response) => {
      let { lb_teleset_charges, meta } = response.data;

      this.setState({
        lb_teleset_charges: lb_teleset_charges,
        meta,
      });
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
        total: pagination.total,
        order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
        order_by: sorter.column == undefined ? 'month' : sorter.field,
      }
    });
  };

  render() {
    const { lb_teleset_charges, meta } = this.state

    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      showSizeChanger: true,
    };

    const columns = [
      {
        title: 'Начислено',
        dataIndex: 'fee',
      },
      {
        title: 'Оплачено',
        dataIndex: 'paid',
      },
      {
        title: 'Расчетный месяц',
        dataIndex: 'month',
      },
    ];

    return (
      <Preloader loading={this.state.loading}>
        <Table
          dataSource={lb_teleset_charges}
          columns={columns}
          rowKey={(record) => record.id}
          size="small"
          bordered={true}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </Preloader>
    )
  }
}

export default Charges
