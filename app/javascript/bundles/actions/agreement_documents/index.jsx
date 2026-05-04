import React, { useState, useEffect } from 'react';
import Rest from 'tools/rest';
import { Table, Button, Modal, message, Typography, Form, Row, Col, Input, Select } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  LoadingOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  ArrowDownOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  debounce,
  map as _map,
  includes as _includes,
} from 'lodash';
import dayjs from 'dayjs';

import { QueryMixin } from 'components/mobile_query_mixin';
import AgreementCard from 'components/agreement_card';

const { Text } = Typography;
let debounceLoad = null;

const AgreementDocuments = (props) => {
  const query = new QueryMixin(props)

  const [documents, setDocuments] = useState([]);
  const [streets, setStreets] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [entrances, setEntrances] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleAgreemCard, setVisibleAgreemCard] = useState(false)
  const [search, setSearch] = useState({
    number: query.getParam('number'),
    street_id: query.getParam('street_id') || undefined,
    building_id: query.getParam('building_id') || undefined,
    entrance_id: query.getParam('entrance_id') || undefined,
    flat_id: query.getParam('flat_id') || undefined,
    statuses: query.getParam('statuses') || [],
  });
  const [meta, setMeta] = useState({ page: 1, per: 20, total: 0 });
  const [useDebounce, setUseDebounce] = useState(false)

  const [selectedAgrm, setSelectedAgrm] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [statuses, setStatutses] = useState([])

  useEffect(() => {
    loadStreets();
  }, [])

  useEffect(() => {
    if (selectedAgrm?.number) {
      setVisibleAgreemCard(true)
    } else {
      setVisibleAgreemCard(false)
    }
  }, [selectedAgrm])

  // useEffect(() => {
  //   loadDocuments();
  // }, [meta.page, meta.per]);

  useEffect(() => {
    if (debounceLoad) {
      debounceLoad.cancel();
    }
    debounceLoad = debounce(() => {
      loadDocuments();
    }, 700);

    debounceLoad();

    if (!useDebounce) {
      debounceLoad.flush();
    }
  }, [search, meta.page, meta.per]);

  // useEffect(() => {
  //   loadBuildings();
  // }, [search.street_id])

  // useEffect(() => {
  //   loadFlats(search.building_id);
  //   loadEntrances(search.building_id);
  // }, [search.building_id])

  const loadDocuments = () => {
    setLoading(true);
    const params = {
      page: meta.page,
      per: meta.per,
      search: search,
    };
    query.setParams({
      ...search,
    })
    Rest.get('/api/v1/agreement_documents.json', { params: params })
      .then((response) => {
        const {agreement_documents, statuses, meta} = response.data;
        setDocuments(agreement_documents);
        setStatutses(statuses);
        setMeta(meta);
      })
      .catch(() => { message.error('Ошибка загрузки списка услуг') })
      .finally(() => setLoading(false));
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
      .catch((e) => { console.error('error', e); })
      .finally(() => { setLoading(false); });
  };

  const loadBuildings = (street_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/houses.json?street_id=${street_id}`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setBuildings(_map(suggestions, (s) => {
          return { label: s.value, value: s.id };
        }))
      })
      .catch((e) => { console.error('error', e); })
      .finally(() => { setLoading(false); });
  };

  const loadEntrances = (building_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/entrances.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        setEntrances(_map(data, (v) => {
          return { label: v.name, value: v.entrance_id };
        }))
      })
      .catch((e) => { console.error('error', e); })
      .finally(() => { setLoading(false); });
  };

  const loadFlats = (building_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/flats.json?building_id=${building_id}`)
      .then((response) => {
        const { data } = response;
        setFlats(_map(data, (v) => {
          return { label: v.name, value: v.flat_id };
        }))
      })
      .catch((e) => { console.error('error', e); })
      .finally(() => { setLoading(false); });
  };

  const handleTableChange = (pagination) => {
    setMeta({
      ...meta,
      page: pagination.current,
      per: pagination.pageSize,
    });
  };

  const handleChangeSelector = (value, search_name) => {
    if (search_name == 'street_id') {
      loadBuildings(value);
      search["building_id"] = undefined;
      search["flat_id"] = undefined;
      search["entrance_id"] = undefined;
    };
    if (search_name == 'building_id') {
      loadEntrances(value);
      loadFlats(value);
      search["flat_id"] = undefined;
      search["entrance_id"] = undefined;
    };
    setSearch({ ...search, [search_name]: value });
    setMeta({ ...meta, page: 1 })
  };

  const handleChangeText = (e) => {
    setUseDebounce(true)
    setSearch({
      ...search, [e.target.name]: e.target.value });
    setMeta({ ...meta, page: 1 })
  };

  const handelRefreshDocUrl = (doc_id) => {
    Rest.post(`/api/v1/agreement_documents/${doc_id}/refresh_doc_url.json`)
      .then((response) => {
        const { agreement_document } = response.data;
        const new_documents = _map(documents, (document)=>{
          if (document.id == agreement_document.id) {
            return agreement_document
          } else {
            return document
          }
        })
        setDocuments(new_documents)
      })
      .catch((e) => { console.error('error', e); })
      .finally(() => {  });
  }

  const columns = [
    { title: '№', dataIndex: 'id', key: 'id' },
    {
      title: 'Договор',
      dataIndex: 'agreement',
      key: 'agreement',
      render: (value) => (
        <div>
          <a onClick={(event) => {
            setSelectedAgrm(value);
            // setVisibleAgreemCard()
          }}>
            {value?.number}
          </a>
          {/* <InfoCircleOutlined
            style={{ marginLeft: '10px' }}
            onClick={() => {
              GotoAccountButton.gotoAccount(record.uid, '_blank');
            }}
          /> */}
        </div>
      )
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      render: (_, record) => (
        <Text>{record?.agreement?.address}</Text>
      )
    },
    { title: 'Тип', dataIndex: 'doc_type', key: 'doc_type' },
    {
      title: 'Статус',
      dataIndex: 'status_name',
      key: 'status_name',
    },
    { title: 'Название', dataIndex: 'title', key: 'title' },
    { title: 'GUID', dataIndex: 'external_uid', key: 'external_uid' },
    {
      title: 'Архив',
      dataIndex: 'archive',
      key: 'archive',
      render: (value) => (
        <Text>{value ? 'В архиве' : 'Актуальный'}</Text>
      )
    },
    {
      title: 'Создан',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : null),
    },
    {
      title: 'Файл',
      dataIndex: 'file',
      key: 'file',
      render: (_, record) => (
        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
          {record.can_action &&
            <>
              {record.file_url &&
                record.url_relevant &&
                record.file_status == "done" &&
                <a href={record.file_url}><ArrowDownOutlined /></a>
              }
              {!record.url_relevant &&
                record.file_status != "performing" &&
                <ReloadOutlined onClick={(event) => { handelRefreshDocUrl(record.id) }} />
              }
              {record.file_status == "performing" && <LoadingOutlined />}
            </>
          }
        </div>
      ),
    },
  ];
  return (
    <React.Fragment>
      {visibleAgreemCard &&
        <Modal
          title={
            <React.Fragment>
              <Text>Карточка договора № {selectedAgrm.number}</Text>
              < InfoCircleOutlined
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  GotoAccountButton.gotoAccount(selectedAgrm.uid, '_blank');
                }}
              />
            </React.Fragment>
          }
          open={visibleAgreemCard}
          onCancel={() => { setVisibleAgreemCard(false) }}
          onOk={() => { setVisibleAgreemCard(false) }}
          footer={false}
          width={'95%'}
        >
          <AgreementCard agrm_id={selectedAgrm.agrm_id} />
        </Modal>}
      <PageHeader title="Электронные документы" />
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              label='Номер договора:'
              labelCol={{ span: 8 }}
              style={{ marginBottom: '5px' }}
            >
              <Input
                name="number"
                value={search.number}
                placeholder="Номер договора"
                onChange={handleChangeText}
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 8 }}
              // wrapperCol={{ span: 19 }}
              label={'Статус:'}
              style={{ marginBottom: '5px' }}
            >
              <Select
                allowClear
                showSearch
                mode='multiple'
                value={search.statuses}
                placeholder='Статусы'
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={statuses}
                onChange={(values) => {
                  setSearch({
                    ...search,
                    statuses: values
                  });
                }}
              />
            </Form.Item>
            {/* <Form.Item
              label='Телефон:'
              labelCol={{ span: 8 }}
              style={{ marginBottom: '5px' }}
            >
              <Input
                controls={false}
                name="phone"
                value={search.phone}
                placeholder="Телефон"
                onChange={this.handleChangeText}
              />
            </Form.Item> */}
          </Col>
          <Col span={6}>
            <Row>
              <Col span={24}>
                <Form.Item
                  label='Улица:'
                  labelCol={{ span: 8 }}
                  //wrapperCol={{ span: 20 }}
                  style={{ marginBottom: '5px' }}
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
              <Col span={12}>
                <Form.Item
                  label='Дом:'
                  labelCol={{ span: 8 }}
                  style={{ marginBottom: '5px' }}
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
              {/* <Col span={8}>
                <Form.Item
                  label='Под.:'
                  labelCol={{ span: 8 }}
                  style={{ marginBottom: '5px' }}
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
              </Col> */}
              <Col span={12}>
                <Form.Item
                  label='Кв.:'
                  labelCol={{ span: 8 }}
                  style={{ marginBottom: '5px' }}
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
          <Col span={6}>
          </Col>
          <Col span={5}>
            {/* <Form.Item
              label='Тарифы:'
              labelCol={{ span: 8 }}
              style={{ marginBottom: '5px' }}
            >
              <Select
                allowClear
                showSearch
                value={search.tar_id == '' ? undefined : search.tar_id}
                placeholder='тариф'
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={this.lb_tarifs}
                onChange={this.handleTarifToChange}
              />
            </Form.Item> */}
          </Col>
        </Row>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={documents}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: meta.page,
          pageSize: meta.per,
          total: meta.total,
          showSizeChanger: true,
        }}
      />
    </React.Fragment>
  );
};

export default AgreementDocuments;
