import React from 'react';
import Rest from 'tools/rest';
import { Tabs, Table, Select, List } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { faEdit, faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce, find as _find, replace as _replace } from 'lodash';
import { parseISO as _parseISO, format } from 'date-fns';
import Preloader from 'components/preloader';

const { Option } = Select;

class SiteRequests extends React.Component {
  state = {
    requests: [],
    meta: {
      current: 1,
      pageSize: 10,
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

  loadSupportRequests() {
    const params = {
      ...this.state.sorter,
      current: this.state.meta.current,
      page_size: this.state.meta.pageSize,
      search: this.state.search,
    };
    this.setState({ loading: true, useDebounce: false });
    Rest.get('/api/v1/support_requests.json', { params: params }).then((response) => {
      this.setState({
        requests: response.data.support_requests,
        meta: {
          current: response.data.meta.current,
          pageSize: response.data.meta.page_size,
          total: response.data.meta.total,
        },
        sorter: {
          order: response.data.meta.order,
          order_by: response.data.meta.orderBy,
        },
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Сайт - запросы', '')
  }

  componentDidMount() {
    document.title += ' | Сайт - запросы'
    this.loadSupportRequests()
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.sorter.order !== this.state.sorter.order ||
      prevState.sorter.order_by !== this.state.sorter.order_by ||
      prevState.meta.current !== this.state.meta.current ||
      prevState.meta.pageSize !== this.state.meta.pageSize
    ) {
      this.loadSupportRequests();
    }

  };

  handleTableChange = (pagination, filters, sorter) => {
    const newsorter = {
      order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
      order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    };
    this.setState({ meta: pagination, sorter: newsorter });
  };

  render() {
    const { requests } = this.state;

    const pagination = {
      ...this.state.meta,
      showSizeChanger: true,
    };

    const columns = [
      {
        title: 'Телефон',
        dataIndex: 'phone',
        // width: '15%',
      },
      {
        title: 'Создан',
        dataIndex: 'created_at',
        // width: '15%',
        // sorter: true,
        render: (_, record) => {
          const date = format(_parseISO(record.created_at), 'dd/MM/yyyy HH:mm:ss');
          return date;
        },
      },
    ];

    return (
      <React.Fragment>
        <Preloader loading={this.state.loading}>
          <PageHeader
            title="Запросы на тех. поддержку"
            style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
          />
          <Table
            columns={columns}
            dataSource={requests}
            rowKey={(record) => record.id}
            pagination={pagination}
            expandable={{
              expandRowByClick: true,
              expandedRowRender: record => <p>{record.message}</p>,
              rowExpandable: record => record.message,
            }}
            size="small"
            onChange={this.handleTableChange}
            bordered={true}
          />
        </Preloader>
      </React.Fragment>
    );
  }
}

export default SiteRequests;
