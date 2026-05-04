import React, { Component } from 'react';
import Rest from 'tools/rest';
import { debounce, isEqual as _isEqual, replace as _replace } from 'lodash';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import {
  Table,
  BackTop,
  Select,
  Input,
  Row,
  Col,
  Form,
  Modal,
  Typography,
  DatePicker,
  Button,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { red, volcano, green, yellow } from '@ant-design/colors';
import { parseISO as _parseISO, format } from 'date-fns';
import { find as _find, map as _map, includes as _includes } from 'lodash'

import WhiteIpCard from 'components/white_ip_card';
import AgreementCard from 'components/agreement_card';
import QueryMixin from 'components/query_mixin';

const { Text } = Typography;
const { RangePicker } = DatePicker;

class WhiteIpList extends QueryMixin {
  state = {
    white_ip_addresses: [],
    meta: {
      page: this.getQuery('page') || 1,
      per: this.getQuery('per') || 50,
      total: 0,
    },
    search: {
      ip: this.getQuery('ip'),
      agreement: this.getQuery('agreement'),
      // created_at_from: this.getQuery('created_at_from'),
      // created_at_to: this.getQuery('created_at_to'),
      // withdraw_at: this.getQuery('withdraw_at'),
      // status: this.getQuery('status'),
      // number: this.getQuery('number'),
      // lk_phone: this.getQuery('lk_phone'),
      // active: this.getQuery('active'),
      // agrm_number: this.getQuery('agrm_number')
    },
    loading: false,
    useDebounce: false,
    visibleCard: false,
    visibleAgreementCard: false,
    white_ip_address: {},
    data_relevance: null,
  };

  loadData = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      search: this.state.search,
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true, useDebounce: false });

    this.loadRequest = Rest.get('/api/v1/white_ip_addresses.json', { params: params }).then(
      (response) => {
        const { white_ip_addresses, meta } = response.data;
        this.setState({
          white_ip_addresses,
          meta,
          loading: false,
        });
        this.setQuery({
          ...this.state.search,
          page: meta.page,
          per: meta.per,
        });
      },
    );
  };

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
    document.title = _replace(document.title, ' | Белые IP', '')
  }

  componentDidMount() {
    document.title += ' | Белые IP'
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per) ||
      prevState.data_relevance !== this.state.data_relevance
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadData();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  };

  handleChangeText = (e) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, [e.target.name]: e.target.value },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    // const newsorter = {
    //   order: sorter.order == undefined ? 'desc' : sorter.order.replace('end', ''),
    //   order_by: sorter.column == undefined ? 'created_at' : sorter.field,
    // };
    this.setState({
      meta: {
        page: pagination.current,
        per: pagination.pageSize,
      }
    });
  };

  render() {
    const {
      loading,
      search,
      visibleCard,
      visibleAgreementCard,
      white_ip_address,
      white_ip_addresses,
      meta,
      agreement,
    } = this.state;
    const { classes } = this.props
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      position: ['bottomCenter'],
      defaultCurrent: '1',
      showSizeChanger: true,
    };

    const columns = [
      {
        title: 'IP-адрес',
        dataIndex: 'ip',
        key: 'ip',
        width: '15%',
      },
      {
        title: 'Договор',
        dataIndex: 'agreement',
        key: 'agreement',
        render: (value) => {
          if (value?.agrm_id) {
            return (
              <a onClick={() => {
                this.setState({
                  agreement: value,
                  visibleAgreementCard: true,
                })
              }}>
                {value?.number} (ID: {value?.agrm_id})
              </a>
            )
          }
        },
        width: '10%',
      },
      {
        title: 'Описание',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Комментарий',
        dataIndex: 'comment',
        key: 'comment',
        width: '30%',
      },
    ];

    return (
      <React.Fragment>
        <BackTop />
        <PageHeader title="Реестр белых IP-адресов"></PageHeader>
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Ip-адрес:"
              >
                <Input
                  controls={false}
                  name="ip"
                  value={search.ip}
                  placeholder="адрес"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                label='№ договора:'
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <Input
                  name="agreement"
                  value={search.agreement}
                  placeholder="№ договора"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {visibleCard &&
          <Modal
            title={`Ip - ${ white_ip_address?.ip}`}
            visible={visibleCard}
            onCancel={() => { this.setState({ visibleCard: false, data_relevance: new Date() }) }}
            onOk={() => { this.setState({ visibleCard: false, data_relevance: new Date() }) }}
            footer={false}
            width={'60%'}
          >
            <WhiteIpCard whiteIpAddressId={white_ip_address?.id}/>
          </Modal>}
        {visibleAgreementCard &&
          <Modal
            title={`Карточка договора № ${agreement?.number}`}
            visible={visibleAgreementCard}
            onCancel={() => { this.setState({ visibleAgreementCard: false }) }}
            onOk={() => { this.setState({ visibleAgreementCard: false }) }}
            footer={false}
            width={'95%'}
          >
            <AgreementCard agrm_id={this.state.agreement?.agrm_id} />
          </Modal>
        }
        <Row gutter={20}>
          <Col>
            <Button
              key="add_white_ip"
              type="button"
              onClick={() => this.setState({ visibleCard: true, white_ip_address: null })}
              style={{ backgroundColor: 'limegreen' }}
            >
              Новый ip-адрес
            </Button>
          </Col>
          <Col
            style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}
          >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </Col>
        </Row>
        <Table
          style={{ marginTop: '10px' }}
          rowKey={(record) => record.id}
          loading={loading}
          columns={columns}
          dataSource={white_ip_addresses}
          hideOnSinglePage={true}
          onChange={this.handleTableChange}
          pagination={pagination}
          onRow={(record, rowIndex) => {
            return {
              onClick: event => { this.setState({ visibleCard: true, white_ip_address: record }) },
            };
          }}
        />
      </React.Fragment >
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

export default withStyles(styles)(WhiteIpList);
