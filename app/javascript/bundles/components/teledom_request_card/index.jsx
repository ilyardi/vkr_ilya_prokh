import React, { useState, useEffect, useReducer } from 'react';
import Rest from 'tools/rest';
import {
  Button,
  message,
  Modal,
  Table,
  Typography,
  Form,
  Input,
  Popconfirm,
  Row,
  Col,
  Select,
  Switch,
  DatePicker,
  Tabs,
  Empty,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  findIndex as _findIndex,
  reject as _reject,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import AgreementCard from 'components/agreement_card';
import UserSearchModal from 'components/user_search_modal';
import RequestsList from './components/requests_list';
import EventList from './components/events_list';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TeledomRequestCard = (props) => {
  const [teledomRequest, setTeledomRequest] = useState({})
  const [teledomRequestId, setTeledomRequestId] = useState(props.teledomRequestId || null)
  const [users, setUsers] = useState([])
  const [activeKey, setActiveKey] = useState()
  const [visibleAgrmCard, setVisibleAgrmCard] = useState(false)
  const [visibleSearchAgrm, setVisibleSearchAgrm] = useState(false)
  const [requests, setRequests] = useState([])
  const [dataRelevance, setDataRelevance] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const statuses = [
    { label: 'Создана', value: 'created' },
    { label: 'В работе', value: 'processing' },
    { label: 'Выполнена', value: 'done' }
  ]

  const subjects = [
    { label: 'Подключение', value: 'connect' },
    { label: 'Отключение', value: 'disconnect' }
  ]

  const getTeledomRequest = () => {
    setLoading(true)
    Rest.get(`/api/v1/teledom_requests/${teledomRequestId}`).then(
      (response) => {
      const { teledom_request, requests} = response.data;
      setTeledomRequest(teledom_request);
      setRequests(requests);
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateTeledomRequest = () => {
    // const params = {
    //   request: {
    //     ...request,
    //     plan_started_at: request.plan_do_daterange ? request.plan_do_daterange[0] : null,
    //     plan_finished_at: request.plan_do_daterange ? request.plan_do_daterange[1] : null,
    //   },
    //   comment: this.state.comment,
    //   helper_users: this.state.helper_users,
    // }
    Rest.put(`/api/v1/teledom_requests/${teledomRequestId}`, { teledom_request: teledomRequest }).then(
      (response) => {
        const { teledom_request } = response.data;
        setTeledomRequest(teledom_request);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadUsers = () => {
    const params = {
      filter: {
        // role: 'manager'
      },
    };
    Rest.get(`/api/v1/users.json`, { params: params }).then((response) => {
      const { users } = response.data;
      setUsers(_map(users, (user) => { return ({ label: user.name, value: user.id })}));
    });
  };

  const handleChoiceAgreement = (v) => {
    setTeledomRequest({
      ...teledomRequest,
      agrm_id: v.id,
      agreement: {
        uid: v.uid,
        number: v.agreement_number,
        address: v.address,
        name: v.name,
        phone: v.phone,
      }
    });
  };

  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (teledomRequestId) {
      getTeledomRequest();
    }
  }, [teledomRequestId, dataRelevance]);

  return (
    <React.Fragment>
      {visibleAgrmCard &&
          <Modal
            title={
              <React.Fragment>
                <Text>Карточка договора № {teledomRequest?.agreement?.number}</Text>
                < InfoCircleOutlined
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    GotoAccountButton.gotoAccount(teledomRequest?.agreement?.uid, '_blank');
                  }}
                />
              </React.Fragment>
            }
            open={visibleAgrmCard}
            onCancel={() => { setVisibleAgrmCard(false) }}
            onOk={() => { setVisibleAgrmCard(false) }}
            footer={false}
            width={'95%'}
          >
            <AgreementCard agrm_id={teledomRequest?.agreement?.id} />
          </Modal>
        }
      {visibleSearchAgrm && (
        <UserSearchModal
          isSearchUserModalVisible={visibleSearchAgrm}
          handleCancelShowSearchUserModal={() => {setVisibleSearchAgrm(false)}}
          handleCloseModal={() => { setVisibleSearchAgrm(false) }}
          handleLocationAgreements={handleChoiceAgreement}
        />
      )}
      <Row gutter={40}>
        <Col span={12} >
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item
              label="Номер:"
            >
              <Text>{teledomRequest?.id}</Text>
            </Form.Item>
            <Form.Item
              label="Телефон"
            >
              <Text><b>{teledomRequest.phone}</b></Text>
            </Form.Item>
            <Form.Item
              label="Тип"
            >
              <Text>{_find(subjects, { value: teledomRequest.subject })?.label}</Text>
            </Form.Item>
            <Form.Item
              label="Статус:"
            >
              <Select
                value={teledomRequest?.status}
                options={statuses}
                onChange={(value)=>{
                  setTeledomRequest({
                    ...teledomRequest,
                    status: value
                  })
                }}
              />
            </Form.Item>
            <Form.Item
              label="Исполнитель:"
            >
              <Select
                value={teledomRequest.user_id}
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => _includes(option.label.toLowerCase(), input.toLowerCase())}
                options={users}
                onChange={(value) => {
                  // this.setState({
                  //   request: {
                  //     ...request,
                  //     executor_user_id: value ? value : null,
                  //   },
                  //   fieldsChanged: true,
                  // })
                  setTeledomRequest({
                    ...teledomRequest,
                    user_id: value
                  })
                  setDataRelevance(true)
                }}
              />
            </Form.Item>
            <Form.Item
              label="Описание:"
            >
              <TextArea
                rows={4}
                name="description"
                onChange={(value) => {
                  setTeledomRequest({
                    ...teledomRequest,
                    description: value
                  })
                }}
                value={teledomRequest.description}
              />
            </Form.Item>
            <Form.Item
              label="Дата создания:"
            >
              <Text>{teledomRequest?.created_at ? format(_parseISO(teledomRequest?.created_at), 'dd.MM.yyyy HH:mm') : null}</Text>
            </Form.Item>
            <Form.Item
              label="Договор"
            >
              {teledomRequest?.agreement?.number ?
                <React.Fragment>
                  <Text>{teledomRequest.agreement.number}</Text>
                  <InfoCircleOutlined
                    style={{ marginLeft: '10px' }}
                    onClick={() => { setVisibleAgrmCard(true) }}
                  />
                  <Button
                    style={{ marginLeft: '20px' }}
                    type="button"
                    onClick={() => {
                      setVisibleSearchAgrm(true);
                    }}
                  >
                    Изменить договор
                  </Button>
                </React.Fragment>
                :
                <React.Fragment>
                  <Text>отсутствует</Text>
                  <Button
                    style={{ marginLeft: '20px' }}
                    type="button"
                    onClick={() => {
                      setVisibleSearchAgrm(true);
                    }}
                  >
                    Выбрать договор
                  </Button>
                </React.Fragment>
              }
            </Form.Item>
            {teledomRequest?.agreement?.number &&
              <React.Fragment>
                <Form.Item
                  label="Адрес:"
                >
                  <Text>{teledomRequest?.agreement?.address}</Text>
                </Form.Item>
                <Form.Item
                  label="ФИО абонента:"
                >
                  <Text>{teledomRequest?.agreement?.name}</Text>
                </Form.Item>
                <Form.Item
                  label="Телефон:"
                >
                  <Text>{teledomRequest?.agreement?.phone}</Text>
                </Form.Item>
              </React.Fragment>
            }
            <Form.Item
              wrapperCol={{ offset: 8, span: 16 }}
            >
              <Button
                style={{ width: '100%' }}
                type='primary'
                htmlType="submit"
                onClick={updateTeledomRequest}
              >
                {teledomRequest?.id ? 'Сохранить' : 'Создать' }
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Tabs
            defaultActiveKey='logs'
            onChange={(activeKey) => {setActiveKey(activeKey)}}
          >
            <TabPane key='logs' tab='События'>
              {(teledomRequest?.events?.length > 0) ?
                <EventList events={teledomRequest?.events} />
                :
                <Empty style={{ marginBottom: '30px' }} />}
            </TabPane>
            <TabPane key='tasks' tab='Задачи' disabled>
              {teledomRequest &&
                <RequestsList
                  dataRelevanceChange={dataRelevanceChange}
                  teledom_request_id={teledomRequest?.id}
                  requests={requests}
                  resource={{
                    resource_id: teledomRequest?.agreement?.id,
                    resource_type: 'LbAgreement',
                    resource: {
                      identifier: teledomRequest?.agreement?.number,
                      address: teledomRequest?.agreement?.address,
                      name: teledomRequest?.agreement?.name,
                      phone: teledomRequest?.agreement?.phone,
                      uid: teledomRequest?.agreement?.uid,
                    }
                  }}
                />
              }
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default TeledomRequestCard;
