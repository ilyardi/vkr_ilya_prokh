import React, { Component } from 'react';
import Rest from 'tools/rest';
import { debounce, isEqual as _isEqual, replace as _replace, map as _map } from 'lodash';
import {
  Table,
  FloatButton,
  Select,
  Input,
  Row,
  Col,
  Form,
  Tag,
  Typography,
  DatePicker,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import QueryMixin from 'components/query_mixin';
import Preloader from 'components/preloader';
import SearchTemplatesPanel from 'components/search_templates_panel';

const { Text } = Typography;

const { RangePicker } = DatePicker;

class AsteriskCalls extends QueryMixin {
  state = {
    asterisk_calls: [],
    meta: {
      page: this.getQuery('page'),
      per: this.getQuery('per'),
      total: 0,
    },
    search: {
      from_num: this.getQuery('from_num'),
      to_num: this.getQuery('to_num'),
      // from_date: this.getQuery('from_date'),
      // to_date: this.getQuery('to_date'),
      time_range: [this.getQuery('time_range_from'), this.getQuery('time_range_to')],
    },
    loading: false,
    useDebounce: false,
  };

  loadData() {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      search: this.state.search,
    };
    if (this.loadRequest) this.loadRequest.cancel();

    this.setState({ loading: true });

    this.loadRequest = Rest.get('/api/v1/asterisk_calls.json', { params: params }).then((response) => {
      const { asterisk_calls, meta } = response.data;
      this.setState({
        asterisk_calls,
        meta,
      });

      // this.setQuery({
      //     ...this.state.search,
      //     page: meta.page,
      //     per: meta.per,
      // });
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });;
  };

  componentWillUnmount() {
    if (this.loadRequest) this.loadRequest.cancel();
    document.title = _replace(document.title, ' | Звонки', '')
  }

  componentDidMount() {
    document.title += ' | Звонки'
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !_isEqual(prevState.search, this.state.search) ||
      !_isEqual(prevState.meta.page, this.state.meta.page) ||
      !_isEqual(prevState.meta.per, this.state.meta.per)
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
  }

  handleSetQuery = (meta) => {
    let searchToUrl = {}
    _forEach(this.state.search, (value, key) => {
      if (key == 'time_range') {
        searchToUrl[`${key}_from`] = value[0];
        searchToUrl[`${key}_to`] = value[1];
        return
      }
      searchToUrl[key] = value;
    })
    this.setQuery({
      ...searchToUrl,
      page: meta.page,
      per: meta.per,
      order: meta.order,
      order_by: meta.order_by,
    });
  }

  handleChangeText = (e) => {
    this.setState({
      useDebounce: true,
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, [e.target.name]: e.target.value },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: pagination.current,
        per: pagination.pageSize,
      }
    });
  };

  handleSetSearch = (searchParams) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: {
        ...this.state.search,
        ...searchParams
      }
    })
  };

  render() {
    const {
      asterisk_calls,
      loading,
      search,
      meta
    } = this.state;
    const pagination = {
      current: meta.page,
      pageSize: meta.per,
      total: meta.total,
      position: ['bottomCenter'],
      defaultCurrent: '1',
      showSizeChanger: true,
    };

    const columns = [
      { title: 'Откуда', dataIndex: 'from_num', key: 'from_num' },
      { title: 'Куда', dataIndex: 'to_num', key: 'to_num' },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        render: (value) => (
          value == "ANSWERED" ?
            (<Tag color={'green'}>Отвечен</Tag>)
            :
            (<Tag color={'volcano'}>Пропущен</Tag>)
        )

      },
      {
        title: 'Время начала',
        dataIndex: 'start_time',
        key: 'start_time',
        render: (value) => (
          value ? format(_parseISO(value), 'dd.MM.yyyy HH:mm:ss') : ''
        )
      },
      {
        title: 'Время завершения',
        dataIndex: 'end_time',
        key: 'end_time',
        render: (value) => (
          value ? format(_parseISO(value), 'dd.MM.yyyy HH:mm:ss') : ''
        )
      },
    ];

    return (
      <React.Fragment>
        <FloatButton.BackTop />
        <PageHeader title="Звонки"></PageHeader>
        {/* <Row justify="space-between">
          <Col>

          </Col>
        </Row> */}
        <Form
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          // layout="inline"
          // style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={4}>
              <Form.Item
                label={'Откуда:'}
                style={{ marginBottom: '5px' }}
              >
                <Input
                  name="from_num"
                  value={search.from_num}
                  placeholder="Откуда"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label={'Куда:'}
                style={{ marginBottom: '5px' }}
              >
                <Input
                  name="to_num"
                  value={search.to_num}
                  placeholder="Куда"
                  onChange={this.handleChangeText}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label={'Статус:'}
                style={{ marginBottom: '5px' }}
              >
                <Select
                  allowClear
                  value={search.status}
                  placeholder='Статус'
                  options={[
                    { value: 'ANSWERED', label: "Отвечен" },
                    { value: 'NOANSWER', label: "Пропущен" }
                  ]}
                  onChange={(value) => {
                    this.setState({
                      search: {
                        ...search,
                        status: value
                      }
                    })
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={'Период:'}
                style={{ marginBottom: '5px' }}
              >
                <RangePicker
                  value={search.time_range[0] && search.time_range[1] ?
                    _map(search.time_range, (item) => { return dayjs(item, 'DD.MM.YYYY') })
                    :
                    null
                  }
                  placeholder={['с', 'по']}
                  format={'DD.MM.YYYY'}
                  onChange={(dates, dateStrings) => {
                    this.setState({
                      search: {
                        ...search,
                        time_range: dateStrings
                      }
                    })
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Row>
          <SearchTemplatesPanel searchParams={search} setSearchParams={this.handleSetSearch} searchableType="ast_calls" />
        </Row>
        <Preloader loading={loading}>
          <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
            <Text>
              Общее кол-во: {meta.total} шт.
            </Text>
          </div>
          <Table
            rowKey={(record) => record.id}
            loading={loading}
            columns={columns}
            dataSource={asterisk_calls}
            hideOnSinglePage={true}
            onChange={this.handleTableChange}
            pagination={pagination}
            expandable={{
              expandedRowRender: (record) => (
                <audio
                  src={record.audio_url}
                  controls={true}
                  style={{ width: '700px' }}
                >
                </audio>
              ),
              expandRowByClick: true,
              rowExpandable: (record) => (record.audio_url),
              showExpandColumn: false,
            }}
          />
        </Preloader>
      </React.Fragment >
    );
  }
}

export default AsteriskCalls;
