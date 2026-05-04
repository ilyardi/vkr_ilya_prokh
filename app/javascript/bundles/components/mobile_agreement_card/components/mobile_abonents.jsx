import React from 'react';
import Rest from 'tools/rest';
import {
  Tag,
  Popover,
  Button,
  Popconfirm,
  Card,
  Typography,
} from 'antd';
import { toast } from 'react-toastify';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { reject as _reject } from 'lodash';

const { Text } = Typography;

class Abonents extends React.Component {
  state = {
    data: this.props.abonents || [],
  };

  componentDidUpdate(prevProps) {
    if (prevProps.abonents !== this.props.abonents) {
      this.setState({ data: this.props.abonents });
    }
  }

  handelDeleteDogovor = (dogovor_id) => {
    Rest.delete(`api/v1/dogovors/${dogovor_id}`)
      .then(() => {
        this.setState({
          data: _reject(
            this.state.data,
            (dogovor) => dogovor.dogovor_id == dogovor_id
          ),
        });
        toast.success('Связка удалена');
      })
      .catch(() => {
        toast.error('Невозможно удалить связку');
      });
  };

  render() {
    const { data } = this.state;

    if (data.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
            fontSize: '14px',
          }}
        >
          Нет данных о прикрепленных абонентах
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {data.map((record, index) => (
          <Card
            key={record.id || index}
            size="small"
            style={{ borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text strong style={{ fontSize: '16px' }}>
                  ID {record.id}
                </Text>
                {record.confirmed_lk ? (
                  <Tag color="green">ПЛК</Tag>
                ) : (
                  <Tag color="volcano">ЛК</Tag>
                )}
              </div>

              {/* Main Info Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Телефон:</Text>
                  <Text>{record.phone || '-'}</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Text type="secondary">Email:</Text>
                    <Text>{record.email || '-'}</Text>
                  </div>
                  {record.unconfirmed_email && (
                    <Text style={{ color: '#1677ff', fontSize: '12px' }}>
                      → {record.unconfirmed_email}
                    </Text>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Бонус:</Text>
                  <Text>{record.bonus_rate || '0'}</Text>
                </div>
              </div>

              {/* Auto Payment Section */}
              {record.auto_payment_method && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                  <Text type="secondary">Автоплатеж:</Text>
                  <Popover
                    trigger="click"
                    content={
                      <div style={{ fontSize: '14px' }}>
                        <p><b>Сумма:</b> {record.auto_payment_method.amount}</p>
                        <p><b>Карта:</b> **{record.auto_payment_method.card}</p>
                        <p><b>Оплата:</b> {dayjs(record.auto_payment_method.date).format('DD.MM.YYYY')}</p>
                        <p><b>Создан:</b> {dayjs(record.auto_payment_method.created_at).format('DD.MM.YYYY HH:mm')}</p>
                      </div>
                    }
                  >
                    <Button type="link" size="small">
                      Установлен
                    </Button>
                  </Popover>
                </div>
              )}

              {/* Dates Section */}
              <div style={{ fontSize: '12px', color: '#999', borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {record.created_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Создан:</span>
                    <span>{dayjs(record.created_at).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                )}
                {record.updated_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Обновлен:</span>
                    <span>{dayjs(record.updated_at).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                )}
                {record.confirmed_at && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Подтвержден:</span>
                    <span>{dayjs(record.confirmed_at).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                <Popconfirm
                  placement="topRight"
                  title="Удалить связку?"
                  onConfirm={(e) => {
                    if(e) e.stopPropagation();
                    this.handelDeleteDogovor(record.dogovor_id);
                  }}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button
                    icon={<DeleteOutlined style={{ fontSize: '24px' }} />}
                    type="text"
                    danger
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
}

export default Abonents;
