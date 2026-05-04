import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  ConfigProvider,
  Table,
  Pagination,
  List,
  Typography,
  Col,
  Row,
  Button,
  Form,
  Input,
  Select,
  message,
  Modal,
} from 'antd';
import { Popup, Tabs, InfiniteScroll } from 'antd-mobile'
import { sleep } from 'antd-mobile/es/utils/sleep'
import {
  FlagOutlined,
  CheckOutlined,
  PlusOutlined,
  CloseOutlined,
  SlidersOutlined,
  DownOutlined,
  ReloadOutlined,
  FlagFilled,
} from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import {
  debounce,
  find as _find,
  remove as _remove,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
  pull as _pull,
  concat as _concat,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import { QueryMixin } from 'components/mobile_query_mixin';
import TeledomRequestCard from 'components/teledom_request_card'

const { Text } = Typography;
let debounceLoad = null;

const TeledomRequests = (props) => {

  const [messageApi, contextHolder] = message.useMessage();

  const toastify = (type, content) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const query = new QueryMixin(props)

  const { classes, match } = props;
  const [teledomRequests, setTeledomRequests] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    per: 20,
    total: 0,
    order: query.getParam('order'),
    order_by: query.getParam('order_by'),
  });
  const [search, setSearch] = useState({
    number: query.getParam('number'),
    status: query.getParam('status'),
    subject: query.getParam('subject'),
    phone: query.getParam('phone'),
    created_at: query.getParam('created_at') || [null, null],
    street_id: query.getParam('street_id'),
    building_id: query.getParam('building_id'),
    entrance_id: query.getParam('entrance_id'),
    flat_id: query.getParam('flat_id'),
  });

  const [ streets, setStreets] = useState([])
  const [ buildings, setBuildings ] = useState([])
  const [ entrances, setEntrances ] = useState([])
  const [ flats, setFlats ] = useState([])
  const [ useDebounce, setUseDebounce ] = useState(false)
  const [ visibleCard, setVisibleCard ] = useState(false)
  const [ teledomRequest, setTeledomRequest ] = useState(null)

  const [loading, setLoading] = useState(false);

  const statuses = [
    { label: 'Создана', value: 'created' },
    { label: 'В работе', value: 'processing' },
    { label: 'Выполнена', value: 'done' }
  ]

  const subjects = [
    { label: 'Подключение', value: 'connect' },
    { label: 'Отключение', value: 'disconnect' }
  ]

  const loadData = () => {
    const params = {
      page: meta.page,
      per: meta.per,
      order: meta.order,
      order_by: meta.order_by,
      search: search,
    };
    query.setParams({
      ...search,
      // created_at: [search.created_at[0], search.created_at[1]]
    })
    setLoading(true);
    Rest.get('/api/v1/teledom_requests.json', { params: params }).then(
      (response) => {
        const { teledom_requests, meta, total } = response.data;
        setTeledomRequests(teledom_requests)
        setMeta(meta)
      }).finally(() => {
        setLoading(false);
      });
  };

  const loadStreets = () => {
    setLoading(true);
    Rest.get(`/api/v1/addresses.json`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setStreets(_map(suggestions, (s) => {
          return { label: s.value, value: s.id, key: s.id }
        }))
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadBuildings = (street_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/houses.json?street_id=${street_id}`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setBuildings(_map(suggestions, (s) => {
          return { label: s.value, value: s.id };
        }));
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadEntrances = (building_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/entrances.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        setEntrances(_map(data, (v) => {
          return { label: v.name, value: v.entrance_id };
        }));
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadFlats = (building_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/flats.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        setFlats(_map(data, (v) => {
          return { label: v.name, value: v.flat_id };
        }));
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChangeSelector = (value, search_name) => {
    if (search_name == 'street_id') { loadBuildings(value) }
    if (search_name == 'building_id') {
      loadEntrances(value);
      loadFlats(value);
    }
    setSearch({ ...search, [search_name]: value });
    setMeta({ ...meta, page: 1 })
  };

  const handleChangeInput = (e) => {
    setUseDebounce(true)
    setSearch({ ...search, [e.target.name]: e.target.value });
    setMeta({ ...meta, page: 1 })
  };

  const handleTableChange = (pagination) => {
    setMeta({
      ...meta,
      page: pagination.current,
      per: pagination.pageSize,
    })
  };

  useEffect(() => {
    // loadData();
    loadStreets();
  }, []);

  useEffect(() => {
    if (debounceLoad) {
      debounceLoad.cancel();
    }
    debounceLoad = debounce(() => {
      loadData();
    }, 700);

    debounceLoad();

    if (!useDebounce) {
      debounceLoad.flush();
    }
  }, [search, meta.page]);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: '7%'
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      width: '10%'
    },
    {
      title: 'Тип',
      dataIndex: 'subject',
      key: 'subject',
      width: '13%',
      render: (value) => (_find(subjects, { value: value })?.label),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (value) => (_find(statuses, { value: value })?.label)
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Договор',
      dataIndex: 'agrm_id',
      key: 'agreement',
      width: '7%',
      render: (value, record) => (record?.agreement?.number)
    },
    {
      title: 'Адрес',
      dataIndex: 'agrm_id',
      key: 'address',
      width: '15%',
      render: (value, record) => (record?.agreement?.address)
    },
    {
      title: 'Создана',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '12%',
      render: (value) => {
        return (value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null)
      }
    },
  ];

  return (
    <React.Fragment>
      <PageHeader title="Заявки Телесеть.Дом"></PageHeader>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label='№ заявки:'
            >
              <Input
                name="number"
                value={search.number}
                placeholder="Номер заявки"
                onChange={handleChangeInput}
              />
            </Form.Item>
            <Form.Item
              label="Телефон:"
            >
              <Input
                controls={false}
                name="phone"
                value={search.phone}
                placeholder="Телефон"
                onChange={handleChangeInput}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item
              label='Статус:'
            >
              <Select
                allowClear
                value={search.status || null}
                options={statuses}
                placeholder="Статус"
                onChange={(value) => { handleChangeSelector(value, 'status') }}
              />
            </Form.Item>
            <Form.Item
              label='Тип заявки:'
            >
              <Select
                allowClear
                value={search.subject || null}
                options={subjects}
                placeholder="Тип заявки"
                onChange={(value) => { handleChangeSelector(value, 'subject') }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>

          </Col>
          <Col span={6}>
            <Row>
              <Col span={24}>
                <Form.Item
                  label='Улица:'
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  <Select
                    allowClear
                    showSearch
                    // key={this.state.key}
                    value={search.street_id == '' ? undefined : search.street_id}
                    placeholder='Улица'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                    options={streets}
                    onChange={(value) => { handleChangeSelector(value, 'street_id') }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={8}>
                <Form.Item
                  label='Дом:'
                  labelCol={{ span: 8 }}
                // wrapperCol={{ span: 12 }}
                >
                  <Select
                    allowClear
                    showSearch
                    disabled={search.street_id ? false : true}
                    value={search.building_id == '' ? undefined : search.building_id}
                    placeholder='дом'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label, input)}
                    options={buildings}
                    onChange={(value) => { handleChangeSelector(value, 'building_id') }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label='Под.:'
                  labelCol={{ span: 10 }}
                >
                  <Select
                    allowClear
                    showSearch
                    disabled={search.building_id ? false : true}
                    value={search.entrance_id == '' ? undefined : search.entrance_id}
                    placeholder='под.'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label, input)}
                    options={entrances}
                    onChange={(value) => { handleChangeSelector(value, 'entrance_id') }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label='Кв.:'
                  labelCol={{ span: 10 }}
                >
                  <Select
                    allowClear
                    showSearch
                    disabled={search.building_id ? false : true}
                    value={search.flat_id == '' ? undefined : search.flat_id}
                    placeholder='кв.'
                    optionFilterProp="children"
                    filterOption={(input, option) => _includes(option.label, input)}
                    options={flats}
                    onChange={(value) => { handleChangeSelector(value, 'flat_id') }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      {visibleCard &&
        <Modal
          title={`Заявка Телесеть.Дом № ${teledomRequest.id}`}
          visible={visibleCard}
          onCancel={() => { setVisibleCard(false) }}
          onOk={() => { setVisibleCard(false) }}
          footer={false}
          width={'80%'}
        >
          <TeledomRequestCard teledomRequestId={teledomRequest?.id} />
        </Modal>}
      <div style={{ height: '32px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }} >
        <Text>
          Общее кол-во: {meta.total} шт.
        </Text>
      </div>
      <Table
        rowKey={(record) => record.id}
        loading={loading}
        columns={columns}
        dataSource={teledomRequests}
        hideOnSinglePage={true}
        onChange={handleTableChange}
        pagination={{
          current: meta.page,
          pageSize: meta.per,
          total: meta.total,
          position: ['bottomCenter'],
          defaultCurrent: '1',
          showSizeChanger: true,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => {
              setTeledomRequest(record);
              setVisibleCard(true)
            },
          };
        }}
        rowClassName={(record, index) => {
          switch (record.status) {
            case 'processing':
              return classes['warning'];
            case 'done':
              return classes['success'];
          }
        }}
      />
    </React.Fragment >
  );
};


const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, null)(TeledomRequests);
