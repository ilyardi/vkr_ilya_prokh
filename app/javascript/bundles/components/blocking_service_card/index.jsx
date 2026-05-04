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
  Empty
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
import RequestsList from './components/requests_list';
import EventList from './components/events_list';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const BlockingServiceCard = (props) => {

  const [blockingService, setBlockingService] = useState({})
  const [blockingServiceId, setBlockingServiceId] = useState(props.blockingServiceId || null)
  const [statuses, setStatuses] = useState([])
  const [requests, setRequests] = useState([])
  const [activeKey, setActiveKey] = useState()
  const [visibleAgrmCard, setVisibleAgrmCard] = useState(false)
  const [visibleSearchAgrm, setVisibleSearchAgrm] = useState(false)
  const [visibleSearchAbon, setVisibleSearchAbon] = useState(false)
  const [dataRelevance, setDataRelevance] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const getBlockingService = () => {
    setLoading(true)
    Rest.get(`/api/v1/blocking_services/${blockingServiceId}`).then(
      (response) => {
      const { blocking_service, statuses, requests} = response.data;
      setBlockingService(blocking_service);
      setStatuses(statuses);
      setRequests(requests);
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateBlockingService = () => {
    const blocking_service = blockingService
    Rest.put(`/api/v1/blocking_services/${blockingServiceId}`, { blocking_service }).then(
      (response) => {
        const { blocking_service } = response.data;
        setBlockingService(blocking_service);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  }

  useEffect(() => {
    if (blockingServiceId) {
      getBlockingService();
    }
  }, [blockingServiceId, dataRelevance]);

  return (
    <React.Fragment>
      {visibleAgrmCard &&
          <Modal
            title={
              <React.Fragment>
                <Text>Карточка договора № {blockingService?.agreement?.number}</Text>
                < InfoCircleOutlined
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    GotoAccountButton.gotoAccount(blockingService?.agreement?.uid, '_blank');
                  }}
                />
              </React.Fragment>
            }
            visible={visibleAgrmCard}
            onCancel={() => { setVisibleAgrmCard(false) }}
            onOk={() => { setVisibleAgrmCard(false) }}
            footer={false}
            width={'95%'}
          >
            <AgreementCard agrm_id={blockingService?.agreement?.id} />
          </Modal>
        }
      <Row gutter={40}>
        <Col span={12} >
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item
              label="Номер:"
            >
              <Text>{blockingService?.id}</Text>
            </Form.Item>
            <Form.Item
              label="Телефон ЛК"
            >
              {blockingService?.abonent?.phone ?
                <Text>{blockingService?.abonent?.phone}</Text>
                :
                <div>Поиск абонента</div>
              }
            </Form.Item>
            <Form.Item
              label="Статус:"
            >
              <Select
                value={blockingService?.status}
                options={statuses}
                onChange={(value)=>{
                  setBlockingService({
                    ...blockingService,
                    status: value
                  })
                }}
              />
            </Form.Item>
            <Form.Item
              label="Состояние:"
            >
              <Switch
                checked={blockingService?.active ? true : false}
                checkedChildren={"Активна"}
                unCheckedChildren={"Не активна"}
                onChange={(checked)=>{
                  setBlockingService({
                    ...blockingService,
                    active: checked
                  })
                }}
              />
            </Form.Item>
            <Form.Item
              label='Период блокировки:'
            >
              <RangePicker
                style={{ width: "100%"}}
                picker="month"
                value={[
                  blockingService?.from_date ? dayjs(blockingService?.from_date) : null,
                  blockingService?.to_date ? dayjs(blockingService?.to_date) : null,
                ]}
                onChange={(dates, dateStrings) => {
                  setBlockingService({
                    ...blockingService,
                    from_date: dates ? dates[0] : null,
                    to_date: dates ? dates[1] : null,
                  })
                }}
              />
            </Form.Item>
            <Form.Item
              label="Дата создания:"
            >
              <Text>{blockingService?.created_at ? format(_parseISO(blockingService?.created_at), 'dd.MM.yyyy HH:mm') : null}</Text>
            </Form.Item>
            <Form.Item
              label="Договор"
            >
              {blockingService?.agreement?.number ?
                <React.Fragment>
                  <Text>{blockingService.agreement.number}</Text>
                  <InfoCircleOutlined
                    style={{ marginLeft: '10px' }}
                    onClick={() => { setVisibleAgrmCard(true) }}
                  />
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
            {blockingService?.agreement?.number &&
              <React.Fragment>
                <Form.Item
                  label="Адрес:"
                >
                  <Text>{blockingService?.agreement?.address}</Text>
                </Form.Item>
                <Form.Item
                  label="ФИО абонента:"
                >
                  <Text>{blockingService?.agreement?.name}</Text>
                </Form.Item>
                <Form.Item
                  label="Телефон:"
                >
                  <Text>{blockingService?.agreement?.phone}</Text>
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
                onClick={updateBlockingService}
              >
                {blockingService?.id ? 'Сохранить' : 'Создать' }
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Tabs
            defaultActiveKey='tasks'
            onChange={(activeKey) => {setActiveKey(activeKey)}}
          >
            <TabPane key='tasks' tab='Задачи'>
              {blockingService &&
                <RequestsList
                  dataRelevanceChange={dataRelevanceChange}
                  blocking_service_id={blockingService?.id}
                  requests={requests}
                    resource={{
                      resource_id: blockingService?.agreement?.id,
                      resource_type: 'LbAgreement',
                      resource: {
                        identifier: blockingService?.agreement?.number,
                        address: blockingService?.agreement?.address,
                        name: blockingService?.agreement?.name,
                        phone: blockingService?.agreement?.phone,
                        uid: blockingService?.agreement?.uid,
                      }
                    }}
                />
              }
            </TabPane>
            <TabPane key='logs' tab='События'>
              {(blockingService?.events?.length > 0) ?
                <EventList events={blockingService?.events} />
                :
                <Empty style={{ marginBottom: '30px' }} />}
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default BlockingServiceCard;
