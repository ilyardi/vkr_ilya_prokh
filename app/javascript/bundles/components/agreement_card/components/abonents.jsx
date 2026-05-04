import React from 'react';
import Rest from 'tools/rest';
import {
  Table,
  Row,
  Col,
  Form,
  Tag,
  Popover,
  Button,
  Popconfirm
} from 'antd';
import { toast } from 'react-toastify';
import { DeleteOutlined } from '@ant-design/icons';
import { DollarTwoTone } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { debounce, find as _find, forEach as _forEach, map as _map, reject as _reject } from 'lodash';
import Preloader from 'components/preloader';

class Abonents extends React.Component {
  state = {
    data: this.props.abonents || [],
  }

  handelDeleteDogovor = (dogovor_id) => {
    Rest.delete(`api/v1/dogovors/${dogovor_id}`)
    .then((response) => {
      this.setState({
        data: _reject(this.state.data, (dogovor) => { return dogovor.dogovor_id == dogovor_id })
      })
      toast.success('Связка удалена');
    })
    .catch((err) => {
      toast.error('Невозможно удалить связку');
    });
  };

  render() {
    const { data } = this.state
    const columns = [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (_, record) => {
          if (record.unconfirmed_email) {
            return `${record.email} -> ${record.unconfirmed_email}`;
          } else {
            return record.email;
          }
        },
      },
      {
        title: 'ПЛК',
        dataIndex: 'confirmed_lk',
        key: 'confirmed_lk',
        render: (value) => {
          return value ?
            <Tag color={'green'}>Подтвержден</Tag>
            :
            <Tag color={'volcano'}>Не подтвержден</Tag>
        }
      },
      { title: 'Бонус', dataIndex: 'bonus_rate', key: 'bonus_rate' },
      {
        title: 'Автоплатеж',
        dataIndex: 'auto_payment_method',
        key: 'auto_payment_method',
        render: (value, record) => {
          return value ?
          <Popover
            content={
              <>
                <p><b>Сумма:</b> {value.amount}</p>
                <p><b>Карта:</b> **{value.card}</p>
                <p><b>Оплата:</b> {dayjs(value.date).format('DD.MM.YYYY')}</p>
                <p><b>Создан:</b> {dayjs(value.created_at).format('DD.MM.YYYY HH:mm:ss')}</p>
              </>
            }
          >
            <div>Установлен</div>
          </Popover>
          :
          null
        },
      },
      {
        title: 'Создан',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value, record) => {
          return value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null;
        },
      },
      {
        title: 'Обновлен',
        dataIndex: 'updated_at',
        render: (value, record) => {
          return value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null;
        },
      },
      {
        title: 'Подтвержден',
        dataIndex: 'confirmed_at',
        key: 'confirmed_at',
        render: (value, record) => {
          return value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : null;
        },
      },
      {
        title: '',
        key: 'action',
        render: (_, record) => (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Popconfirm
              placement="left"
              title="Вы уверены, что хотите удалить связку?"
              onConfirm={(e) => {
                e.stopPropagation();
                this.handelDeleteDogovor(record.dogovor_id);
              }}
              onCancel={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              okText="Да"
              cancelText="Нет"
            >
              <Button icon={<DeleteOutlined />}/>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(record) => record.id}
          size="small"
          bordered={true}
        />
      </React.Fragment>
    )
  }
}

export default Abonents
