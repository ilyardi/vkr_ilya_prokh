import React from 'react';
import Rest from 'tools/rest';
import { Tabs, Table, Select } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { faEdit, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce, find as _find, replace as _replace } from 'lodash';
import { parseISO as _parseISO, format } from 'date-fns';
import Preloader from 'components/preloader';
import { faPeopleCarry } from '@fortawesome/free-solid-svg-icons';

const { TabPane } = Tabs;
const { Option } = Select;

class PhoneConfirmations extends React.Component {
  state = {
    phone_confirmations: [],
    meta: {
      current: 1,
      pageSize: 50,
      total: 0,
    },
    sorter: {
      order: 'desc',
      order_by: 'created_at',
    },
    search: {},
    useDebounce: false,
    loading: false,
  };

  loadPhoneConfirmations() {
    Rest.get('/api/v1/phone_confirmations.json').then((response) => {
      this.setState({ phone_confirmations: response.data.phone_confirmations });
    });
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Смс уведомления', '')
  }

  componentDidMount() {
    document.title += ' | Смс уведомления'
    this.loadPhoneConfirmations()
  }

  handleTableChange = (pagination, filters, sorter) => {
    const newsorter = {
      order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
      order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    };
    this.setState({ meta: pagination, sorter: newsorter });
  };

  render() {
    const { phone_confirmations } = this.state;

    const pagination = {
      ...this.state.meta,
      showSizeChanger: true,
    };

    const columns_confirmations = [
      {
        title: 'Телефон',
        dataIndex: 'phone',
        // width: '15%',
      },
      {
        title: 'Код',
        dataIndex: 'code',
        // key: 'code',
        // width: '35%',
        // sorter: true,
      },
      {
        title: 'Операция',
        dataIndex: 'action',
        // width: '15%',
        // sorter: true,
      },
      {
        title: 'Истекает',
        dataIndex: 'expire_at',
        // width: '15%',
        // sorter: true,
        render: (_, record) => {
          const date = record.expire_at ? format(_parseISO(record.expire_at), 'dd.MM.yyyy HH:mm:ss') : null;
          return date;
        },
      },
      {
        title: 'Создан',
        dataIndex: 'created_at',
        // width: '15%',
        // sorter: true,
        render: (_, record) => {
          const date = format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm:ss');
          return date;
        },
      },
    ];

    return (
      <React.Fragment>
        <Preloader loading={this.state.loading}>
          <PageHeader
            title="Смс коды"
            style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
          />
          <Table
            columns={columns_confirmations}
            dataSource={phone_confirmations}
            rowKey={(record) => record.id}
            pagination={pagination}
            size="small"
            onChange={this.handleTableChange}
            bordered={true}
          />
        </Preloader>
      </React.Fragment>
    );
  }
}

export default PhoneConfirmations;
