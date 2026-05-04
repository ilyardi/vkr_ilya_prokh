import React, { useState } from 'react';
import { Row, Col, List, Switch, Button, Typography, Popover } from 'antd';
import { MessageOutlined, NotificationOutlined, PhoneOutlined, DeleteOutlined } from '@ant-design/icons';
import KeyForm from './components/keyForm';
import SubscriberForm from './components/subscriberForm';

const { Text } = Typography;

const DomInfo = (props) => {
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showSubscriberForm, setShowSubscriberForm] = useState(false);

  const info = props.info;

  const sendCode = () => props.sendCodeDom?.();
  const notifyKeyDone = () => props.notificationAboutKeyDone?.();
  const changeStatus = (checked) => props.changeStatus?.(checked);
  const deleteSubscriber = (phone) => props.handleDeleteSubscriber?.(phone);

  return (
    <div style={{ minHeight: '100vh' }}>

      {showKeyForm &&
        <KeyForm
          showKeyForm={showKeyForm}
          onClose={() => setShowKeyForm(false)}
          agrmNumber={props.agrmNumber}
        />
      }

      {showSubscriberForm &&
        <SubscriberForm
          showSubscriberForm={showSubscriberForm}
          onClose={() => setShowSubscriberForm(false)}
          agrmNumber={props.agrmNumber}
        />
      }

      {/* Статусы */}
      <div style={{ background: "#fff", borderRadius: 10, marginBottom: 8, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #e8e8e8' }}>
        <Text strong>Статусы</Text>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Домофония</Text>
          <Switch checked={!info?.intercom_blocked} disabled />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Блокировка по счету</Text>
          <Switch checked={info?.blocked} onChange={changeStatus} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Блокировка админом</Text>
          <Switch checked={info?.admin_blocked} disabled />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>Код домофона:</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text code>{info?.dom_code ? '******' : 'Нет'}</Text>
            <Popover content="Отправить код по SMS">
              <Button type="text" icon={<MessageOutlined style={{ fontSize: 24 }} />} onClick={sendCode} />
            </Popover>
          </div>
        </div>
      </div>

      {/* Домофония (подъезды) */}
      <div style={{ background: "#fff", borderRadius: 10, marginBottom: 8, padding: '16px', border: '1px solid #e8e8e8' }}>
        <Text strong>Домофония (подъезды)</Text>

        <List
          size="small"
          style={{ marginTop: '12px' }}
          dataSource={info?.entrances}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text type="secondary">ID: {item.domophoneId}</Text>
                <a href={item.url.replace("http:", "https:")} target="_blank" rel="noreferrer">
                  {item.url.replace("http:", "https:")}
                </a>
                <Text>{item.entrance}</Text>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Ключи */}
      <div style={{ background: "#fff", borderRadius: 10, marginBottom: 8, padding: '16px', border: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Ключи</Text>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button onClick={() => setShowKeyForm(true)}>+</Button>
            <Button icon={<NotificationOutlined style={{ fontSize: 22 }} />} onClick={notifyKeyDone} />
          </div>
        </div>

        <List
          size="small"
          style={{ marginTop: '12px' }}
          dataSource={info?.keys}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text>Номер: {item.keyId}</Text>
                <Text type="secondary">ID: {item.rfId}</Text>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Подписчики */}
      <div style={{ background: "#fff", borderRadius: 10, padding: '16px', border: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Подписчики</Text>
          <Button onClick={() => setShowSubscriberForm(true)}>+</Button>
        </div>

        <List
          size="small"
          style={{ marginTop: '12px' }}
          dataSource={info?.subscribers}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0', display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <Text strong>{item.name} {item.patronymic} {item.last}</Text>
                <Text><PhoneOutlined style={{ fontSize: 16, marginRight: 6 }} /> {item.phone}</Text>
                <Text type="secondary">Владелец: {item.owner ? "Да" : "Нет"}</Text>
              </div>
              <Button
                danger
                type="text"
                icon={<DeleteOutlined style={{ fontSize: 22 }} />}
                onClick={() => deleteSubscriber(item.phone)}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default DomInfo;
