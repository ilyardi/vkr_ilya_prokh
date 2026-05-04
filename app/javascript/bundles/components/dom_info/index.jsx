import React, { useState, useEffect, useContext } from 'react';
import { connect, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  Button,
  message,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Steps,
  Checkbox,
  Divider,
  Collapse,
  ConfigProvider,
  FloatButton,
  Popover,
  List,
  Row,
  Col,
  Modal,
  Switch,
} from 'antd';
import {
  NotificationOutlined,
  SendOutlined,
  MessageOutlined,
  DeleteOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
  replace as _replace,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

import KeyForm from './components/keyForm'
import SubscriberForm from './components/subscriberForm';

const { Text } = Typography;
const { TextArea } = Input;

const DomInfo = (props) => {
  const [showKeyForm, setShowKeyForm] = useState(false)
  const [showSubscriberForm, setShowSubscriberForm] = useState(false)

  const sendCodeDom = () => {
    const params = {
      number: props.agrmNumber,
    }
    Rest.post(`/api/teledom/agreements/send_dom_code.json`, params).then(
      (response) => {
        toast.success('Код отправлен абоненту');
      }).catch((e) => {
        toast.error(`${e.response.data.error}`);
      })
  };

  const notificationAboutKeyDone = () => {
    const params = {
      number: props.agrmNumber,
    }
    Rest.post(`/api/teledom/agreements/send_dom_key_done.json`, params).then(
      (response) => {
        toast.success('Уведомление о готовности отправлено пользователю');
      }).catch((e) => {
        toast.error(`${e.response.data.error}`);
      })
  };

  const changeStatus = (checked) => {
    const params = {
      number: props.agrmNumber,
    }
    const action = checked ? 'block' : 'unblock'
    Rest.post(`/api/teledom/agreements/${action}.json`, params).then(
      (response) => {
        toast.success('Операция выполнена успешно');
        props.reloadDom();
      }).catch((e) => {
        toast.error('Ошибка изменения состояния');
      })
  };

  const handleDeleteSubscriber = (phone) => {
    const params = {
      number: props.agrmNumber,
      phone: phone
    }
    Rest.post(`/api/teledom/agreements/del_subscriber.json`, params).then(
      (response) => {
        toast.success('Операция выполнена успешно');
        props.reloadDom();
      }).catch((e) => {
        toast.error('Ошибка изменения состояния');
      })
  };

  return (
    <Row gutter={20}>
      {showKeyForm &&
        <KeyForm
          showKeyForm={showKeyForm}
          onClose={()=>{setShowKeyForm(false)}}
          agrmNumber={props.agrmNumber}
        />
      }
      {showSubscriberForm &&
        <SubscriberForm
          agrmNumber = {props.agrmNumber}
          showSubscriberForm={showSubscriberForm}
          onClose={() => { setShowSubscriberForm(false) }}
          // agrmNumber={props.agrmNumber}
        />
      }
      <Col span={4}>
        <Form
          labelCol={{ span: 14 }}
          wrapperCol={{ span: 10 }}
        >
          <Form.Item label="Домофония" style={{ marginBottom: '5px' }}>
            <Switch
              checked={!props.info?.intercom_blocked}
              checkedChildren = 'Вкл'
              unCheckedChildren = 'Выкл'
              disabled
            />
          </Form.Item>
          <Form.Item label="Блокировка по счету" style={{ marginBottom: '5px' }}>
            <Switch
              checked={props.info?.blocked}
              checkedChildren='Вкл'
              unCheckedChildren='Выкл'
              // disabled
              onChange={changeStatus}
            />
          </Form.Item>
          <Form.Item label="Блокировка админом" style={{marginBottom: '5px'}}>
            <Switch
              defaultChecked={props.info?.admin_blocked}
              checkedChildren='Вкл'
              unCheckedChildren='Выкл'
              disabled
            />
          </Form.Item>
          <Form.Item label="Код домофона" style={{ marginBottom: '5px' }}>
            <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
              <Text>{props.info?.dom_code?.replace(/[\s\S]/g, "*")}</Text>
              <Popover content={"Отправить код по смс"}>
                <MessageOutlined
                  style={{fontSize: '20px', marginLeft: '15px'}}
                  onClick={sendCodeDom}
                />
              </Popover>
            </div>
          </Form.Item>
        </Form>
      </Col>
      <Col span={5}>
        <List
          header={
            <div style={{ height: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '500' }}>Домофония</Text>
            </div>
          }
          dataSource={props.info?.entrances}
          renderItem={(item) => (
            <List.Item style={{ justifyContent: 'flex-start' }}>
              <Row style={{ width: '100%', alignItems: 'center' }}>
                <Col span={4}>
                  <Text>ID: {item.domophoneId}</Text>
                </Col>
                <Col span={20}>
                  <Text>URL: </Text>
                  <a target='_blank' href={_replace(item.url, "http:", "https:")}>{_replace(item.url, "http:", "https:")}</a>
                  <Text>{` (${item.entrance})`}</Text>
                  <Text>{` - ${_includes((item.cms || '').toLowerCase(), 'digital') ? 'Цифровая' : 'Координатная'}`}</Text>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Col>
      <Col span={6}>
        <List
          header={
            <div style={{ height: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={{fontWeight: '500'}}>Ключи</Text>
              <div>
                <Button onClick={(e) => { setShowKeyForm(true) }}>Добавить</Button>
                <Popover content={"Уведомить о готовности ключей"}>
                  <Button style={{marginLeft: '5px'}} onClick={(e) => { notificationAboutKeyDone() }} icon={<NotificationOutlined />}></Button>
                </Popover>
              </div>
            </div>
          }
          dataSource={props.info?.keys}
          renderItem={(item) => (
            <List.Item style={{justifyContent: 'flex-start'}}>
              <Row style={{ width: '100%' }}>
                <Col span={10}>
                  <Text>Номер: {item.keyId}</Text>
                </Col>
                <Col span={14}>
                  <Text>ID: {item.rfId} </Text>
                </Col>
                {/* <Col span={6}>
                  <Text>Комментарий: {item.comments} </Text>
                </Col> */}
              </Row>
            </List.Item>
          )}
        />
      </Col>
      <Col span={9}>
        <List
          header={
            <div style={{ height: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '500' }}>Подписчики</Text>
              <Button onClick={(e) => { setShowSubscriberForm(true) }}>Добавить</Button>
            </div>
          }
          dataSource={props.info?.subscribers}
          renderItem={(item) => (
            <List.Item style={{ justifyContent: 'flex-start' }}>
              <Row style={{ width: '100%', alignItems: 'center' }}>
                <Col span={12}>
                  <Text>{`${item.name} ${item.patronymic} ${item.last}`}</Text>
                </Col>
                <Col span={6}>
                  <PhoneOutlined style={{margin: "0px 5px"}}/>
                  <Text>{item.phone}</Text>
                </Col>
                <Col span={4}>
                  <Text>Владелец: {item.owner ? 'Да' : 'Нет'} </Text>
                </Col>
                <Col span={2}>
                  <Button danger onClick={(e) => { handleDeleteSubscriber(item.phone) }} icon={<DeleteOutlined />} />
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};

export default DomInfo
