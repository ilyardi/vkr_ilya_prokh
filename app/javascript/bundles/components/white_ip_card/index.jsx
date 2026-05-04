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
  isEqual as _isEqual,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import AgreementCard from 'components/agreement_card';
import UserSearchModal from 'components/user_search_modal';
import EventList from './components/events_list';
import GotoAccountButton from 'components/widget/goto_account_button';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const WhiteIpCard = (props) => {

  const [whiteIpAddress, setWhiteIpAddress] = useState({
    ip: null,
    description: null,
    agreement: null,
    agrm_id: null,
  })
  const [currentWIA, setCurrentWIA] = useState({})
  const [whiteIpAddressId, setWhiteIpAddressId] = useState(props.whiteIpAddressId || null)
  const [activeKey, setActiveKey] = useState()
  const [visibleAgrmCard, setVisibleAgrmCard] = useState(false)
  const [visibleSearchAgrm, setVisibleSearchAgrm] = useState(false)
  const [dataRelevance, setDataRelevance] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const getWhiteIpAddress = () => {
    setLoading(true)
    Rest.get(`/api/v1/white_ip_addresses/${whiteIpAddressId}`).then(
      (response) => {
        const { white_ip_address } = response.data;
        setWhiteIpAddress(white_ip_address);
        setCurrentWIA(white_ip_address);
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateWhiteIpAddress = () => {
    const white_ip_address = whiteIpAddress
    Rest.put(`/api/v1/white_ip_addresses/${whiteIpAddressId}`, { white_ip_address }).then(
      (response) => {
        const { white_ip_address } = response.data;
        setWhiteIpAddress(white_ip_address);
        setCurrentWIA(white_ip_address);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        setErrors(e.response.data.white_ip_address.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createWhiteIpAddress = () => {
    const white_ip_address = whiteIpAddress
    Rest.post(`/api/v1/white_ip_addresses.json`, { white_ip_address }).then(
      (response) => {
        const { white_ip_address } = response.data;
        setWhiteIpAddress(white_ip_address);
        setCurrentWIA(white_ip_address);
        toast.success('Изменения сохранены');
      }).catch((e) => {
        setErrors(e.response.data.white_ip_address.errors)
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const dataRelevanceChange = () => {
    setDataRelevance(new Date())
  }

  const handleChangeText = (e) => {
    setWhiteIpAddress({ ...whiteIpAddress, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  };

  const handleChoiceAgreement = (v) => {
    setWhiteIpAddress({
      ...whiteIpAddress,
      agrm_id: v.id,
      agreement: {
        ...whiteIpAddress.agreement,
        agrm_id: v.id,
        uid: v.uid,
        number: v.agreement_number,
        address: v.address,
        name: v.name,
        phone: v.phone,
      }
    })
  };

  useEffect(() => {
    if (whiteIpAddressId) {
      getWhiteIpAddress();
    }
  }, [whiteIpAddressId, dataRelevance]);

  return (
    <React.Fragment>
      {visibleSearchAgrm && (
        <UserSearchModal
          isSearchUserModalVisible={visibleSearchAgrm}
          handleCancelShowSearchUserModal={() => setVisibleSearchAgrm(false)}
          handleCloseModal={() => setVisibleSearchAgrm(false)}
          handleLocationAgreements={handleChoiceAgreement}
        />
      )}
      {visibleAgrmCard &&
        <Modal
          title={
            <React.Fragment>
              <Text>Карточка договора № {whiteIpAddress?.agreement?.number}</Text>
              <InfoCircleOutlined
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  GotoAccountButton.gotoAccount(whiteIpAddress?.agreement?.uid, '_blank');
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
          <AgreementCard agrm_id={whiteIpAddress?.agreement?.agrm_id} />
        </Modal>
      }
      <Row gutter={40}>
        <Col span={12} >
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item
              label="IP"
              help={errors?.ip && errors?.ip.join(", ")}
              validateStatus={errors?.ip && "error"}
            >
              {
                whiteIpAddress?.id ?
                <Text>{whiteIpAddress?.ip}</Text>
                :
                <Input
                  controls={false}
                  name="ip"
                  value={whiteIpAddress?.ip}
                  placeholder="адрес"
                  onChange={handleChangeText}
                />
              }
            </Form.Item>
            <Form.Item
              label="Описание:"
              help={errors?.description && errors?.description.join(", ")}
              validateStatus={errors?.description && "error"}
            >
              <TextArea
                rows={4}
                name="description"
                onChange={handleChangeText}
                value={whiteIpAddress?.description}
              />
            </Form.Item>
            <Form.Item
              label="Дата создания:"
            >
              <Text>{whiteIpAddress?.created_at ? format(_parseISO(whiteIpAddress?.created_at), 'dd.MM.yyyy HH:mm') : null}</Text>
            </Form.Item>
            <Form.Item
              label="Договор"
            >
              {whiteIpAddress?.agreement?.number ?
                <React.Fragment>
                  <Text>{whiteIpAddress.agreement.number}</Text>
                  <InfoCircleOutlined
                    style={{ marginLeft: '10px' }}
                    onClick={() => { setVisibleAgrmCard(true) }}
                  />
                </React.Fragment>
                :
                <React.Fragment>
                  <Text>отсутствует</Text>
                </React.Fragment>
              }
              <Button
                style={{ marginLeft: '20px' }}
                type="button"
                onClick={() => {
                  setVisibleSearchAgrm(true);
                }}
              >
                Выбрать договор
              </Button>
            </Form.Item>
            {whiteIpAddress?.agreement?.number &&
              <React.Fragment>
                <Form.Item
                  label="Адрес:"
                >
                  <Text>{whiteIpAddress?.agreement?.address}</Text>
                </Form.Item>
                <Form.Item
                  label="ФИО абонента:"
                >
                  <Text>{whiteIpAddress?.agreement?.name}</Text>
                </Form.Item>
                <Form.Item
                  label="Телефон:"
                >
                  <Text>{whiteIpAddress?.agreement?.phone}</Text>
                </Form.Item>
              </React.Fragment>
            }
            <Form.Item
              label='Комментарий:'
            >
              <TextArea
                rows={4}
                name='comment'
                onChange={handleChangeText}
                defaultValue=''
                value={whiteIpAddress?.comment}
              />
            </Form.Item>
            {!_isEqual(whiteIpAddress, currentWIA) &&
              <Form.Item
                wrapperCol={{ offset: 8, span: 16 }}
              >
                <Button
                  style={{ width: '100%' }}
                  type='primary'
                  htmlType="submit"
                  onClick={whiteIpAddress?.id ? updateWhiteIpAddress : createWhiteIpAddress}
                >
                  {whiteIpAddress?.id ? 'Сохранить' : 'Создать'}
                </Button>
              </Form.Item>
            }
          </Form>
        </Col>
        <Col span={12}>
          <Tabs
            defaultActiveKey='logs'
            onChange={(activeKey) => {setActiveKey(activeKey)}}
          >
            <TabPane key='logs' tab='События'>
              {(whiteIpAddress?.events?.length > 0) ?
                <EventList events={whiteIpAddress?.events} />
                :
                <Empty style={{ marginBottom: '30px' }} />}
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default WhiteIpCard;
