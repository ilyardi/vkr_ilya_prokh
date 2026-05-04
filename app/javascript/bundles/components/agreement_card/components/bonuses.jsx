import React from 'react';
import Rest from 'tools/rest';
import { AbilityContext } from 'tools/ability';
import {
  Table,
  Row,
  Col,
  Form,
  Tag,
  Button,
  message,
} from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { debounce, find as _find, forEach as _forEach } from 'lodash';

class Bonuses extends React.Component {
  state = {
    charges: this.props.charges || [],
  }

  handleRollbackCharge = (charge_id) => {
    Rest.get(`/api/v1/bonus_charges/${charge_id}/rollback_charge.json`).then(
      (response) => {
        const { charge } = response.data
        this.setState({
          charges: [charge, ...this.state.charges]
         })
        this.props.handleFormUpdate()
        message.success('Откат выполнен успешно')
      }).catch((e) => {
        message.error('Ошибка отката транзакции')
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { charges } = this.state

    const actions = {
      title: '',
      dataIndex: 'actions',
      width: '5%',
      key: 'actions',
      render: (value, record) => {
        return (
          <div style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
            <Button onClick={(e) => { this.handleRollbackCharge(record.id) }} icon={<RollbackOutlined />} />
          </div>
        );
      },
    }

    let columns = [
      {
        title: '№',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Тип операции',
        width: '150px',
        key: 'operation_type',
        render: (_, record) => {
          return record.amount > 0 ? (
            <Tag color={'green'}>Начисление</Tag>
          ) : (
            <Tag color={'volcano'}>Списание</Tag>
          );
        },
      },
      {
        title: 'Кол-во',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Дата операции',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (_, record) => {
          return record.created_at ? dayjs(record.created_at).format('DD.MM.YYYY HH:mm:ss') : null;
        },
      },
      {
        title: 'Платеж',
        dataIndex: 'lk_payment_id',
        key: 'lk_payment_id',
        render: (value) => {
          return (
            <Link to={{ pathname: '/lk_payments', search: `?payment_id=${value}` }}>{value}</Link>
          );
        },
      },
      {
        title: 'Описание',
        dataIndex: 'comment',
        key: 'comment',
      },
    ];

    if (this.context.can('rollback', 'BonusCharges')) {
      columns = [...columns, actions]
    }

    return (
      <React.Fragment>
        <Table
          dataSource={charges}
          columns={columns}
          rowKey={(record) => record.id}
          size="small"
          bordered={true}
        />
      </React.Fragment>
    )
  }
}

Bonuses.contextType = AbilityContext;

export default Bonuses
