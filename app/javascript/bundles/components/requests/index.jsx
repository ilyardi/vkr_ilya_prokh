import React, { Component } from 'react';
import Rest from 'tools/rest';
import { withStyles } from '@material-ui/core/styles';
import { Table, Modal, Button, Typography, Row, Col } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import { red, volcano, green, yellow } from '@ant-design/colors';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  isEqual as _isEqual,
  last as _last,
} from 'lodash';
import dayjs from 'dayjs';

import Preloader from 'components/preloader';
import RequestCard from 'components/request_card';

const { Text } = Typography

class Requests extends Component {
  state = {
    requests: [],
    request: {},
    meta: {},
    search: {},
    visibleCard: false,
    data_relevance: null,
    loading: false,
  };

  constructor(props) {
    super(props);
    props.meta ? this.state = { ...this.state, meta: props.meta } : {}
    props.search ? this.state = { ...this.state, search: props.search } : {}
  };

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
  };

  componentDidMount() {
    this.loadRequests();
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevProps.search, this.props.search)
    ) {
      const { search } = this.props
      this.setState({ search, meta: { ...this.state.meta, page: 1 } })
    }
    if (
      !_isEqual(prevState.search, this.state.search) ||
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.data_relevance !== this.state.data_relevance
    ) {
      this.loadRequests();
    }
  };

  loadRequests = () => {
    const params = {
      ...this.state.meta,
      search: this.state.search,
    };
    if (this.props.handleChangeMeta) this.props.handleChangeMeta(this.state.meta);
    if (this.loadRequest) this.loadRequest.cancel();
    this.setState({ loading: true });
    this.loadRequest = Rest.get('/api/v1/requests.json', { params: params }).then((response) => {
      const { requests, meta } = response.data;
      this.setState({
        requests,
        meta: { ...this.state.meta, ...meta },
      });

    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const newsorter = {
      order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
      order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    };
    const meta = {
      page: pagination.current,
      per: pagination.pageSize,
      total: pagination.total,
    }
    this.setState({ meta: { ...meta, ...newsorter } });
  };

  closerModalRequest = () => {
    this.setState({
      data_relevance: new Date(),
      visibleCard: false,
    });
  };

  render() {
    const {
      request,
      requests,
      meta,
      visibleCard,
    } = this.state;

    const {
      classes
    } = this.props
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      showSizeChanger: true,
    };

    const columns = [
      {
        title: 'Номер',
        dataIndex: 'id',
        key: 'id',
        render: (value, record) => {
          return (
            <>
              <Text>{value}</Text>
              {record.has_files &&
                <PaperClipOutlined style={{marginLeft: '4px'}}/>
              }
            </>
          )
        }
      },
      {
        title: 'Тип',
        dataIndex: 'request_type',
        key: 'request_type',
        render: (value) => {
          return (value ? `${value.name}` : null)
        }
      },
      {
        title: 'Подтип',
        dataIndex: 'request_subtype',
        key: 'request_subtype',
        render: (value) => {
          return (value ? `${value.name}` : null)
        }
      },
      {
        title: 'Статус',
        dataIndex: 'request_status',
        key: 'request_status',
        render: (value) => {
          return (value ? `${value.name}` : null)
        }
      },
      {
        title: 'Причина',
        dataIndex: 'request_reason',
        key: 'request_reason',
        render: (value) => {
          return (value ? `${value.description}` : null)
        }
      },
      {
        title: 'Описание',
        dataIndex: 'description',
        key: 'description',
        width: '20%',
        render: (value) => {
          return (value ? value.slice(0,70)+'...' : null)
        }
      },
      {
        title: 'Создана',
        dataIndex: 'created_at',
        key: 'created_at',
        sorter: true,
        render: (value) => {
          return (value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null)
        }
      },
      {
        title: 'Начало',
        dataIndex: 'plan_started_at',
        key: 'plan_started_at',
        sorter: true,
        render: (value) => {
          return (value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null)
        }
      },
      {
        title: 'Адрес',
        dataIndex: 'resource_address',
        key: 'resource_address',
      },
      {
        title: 'Автор',
        dataIndex: 'responsible_user',
        key: 'responsible_user',
        render: (value) => {
          return (value ? `${value.name}` : null)
        }
      },
      {
        title: 'Исполнитель',
        dataIndex: 'executor_user',
        key: 'executor_user',
        render: (value) => {
          return (value ? `${value.name}` : null)
        }
      },
    ];
    return (
      <React.Fragment>
        {visibleCard &&
          <Modal
            title={`Задача`}
            visible={visibleCard}
            onCancel={this.closerModalRequest}
            onOk={this.closerModalRequest}
            footer={false}
            width={'80%'}
          >
            {request ?
              <RequestCard
                request_id={request.id}
              // dataRelevanceChange={this.dataRelevanceChange}
              />
              :
              <RequestCard
                resource={this.props.resource}
              />
            }
          </Modal>
        }
        <Preloader loading={this.state.loading}>
          <Row gutter={20}>
            <Col>
              <Button
                key="add_request"
                type="button"
                onClick={() => this.setState({ visibleCard: true, request: null })}
                style={{ backgroundColor: 'limegreen' }}
              >
                Создать задачу
              </Button>
            </Col>
            <Col
              style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column'}}
            >
              <Text>
                Общее кол-во: {meta.total} шт.
              </Text>
            </Col>
          </Row>
          <Table
            // title={()=> {
            //   return (<Text>Кол-во: {meta.total}</Text>)
            // }}
            style={{ marginTop: '10px' }}
            dataSource={requests}
            columns={columns}
            rowKey={(record) => record.id}
            pagination={pagination}
            size="small"
            onChange={this.handleTableChange}
            onRow={(record, rowIndex) => {
              return {
                onClick: event => { this.setState({ visibleCard: true, request: record }) },
              };
            }}
            rowClassName={(record, index) => {
              if (record.status_notified_at) return classes['danger'];
              // return classes[record.class_name];
            }}
          />
        </Preloader>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  danger: {
    backgroundColor: red[1],
  },
  warning: {
    backgroundColor: yellow[1],
  },
  success: {
    backgroundColor: green[1],
  },
  error: {
    backgroundColor: volcano[1],
  },
});

export default withStyles(styles)(Requests);
