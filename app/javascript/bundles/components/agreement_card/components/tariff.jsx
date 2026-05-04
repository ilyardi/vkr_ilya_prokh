import React from 'react';
import {
  Button,
  Table,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import { find as _find, forEach as _forEach } from 'lodash';

const {Text} = Typography

class Tariff extends React.Component {
  state = {
    tariffs: this.props.tariffs || [],
  }
  render() {
    const { tariffs } = this.state
    const columns = [
      {
        title: 'Логин',
        dataIndex: 'login',
        key: 'login',
        // width: '10%',
      },
      {
        title: 'Описание тарифа',
        dataIndex: 'descr',
        key: 'descr',
        render: (value, record) => {
          return (
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <Text>{value}</Text>
              {value && value.includes("Умный домофон") &&
                <Button
                  onClick={(e) => {
                    this.props.syncDom();
                  }}
                >
                  Синхронизировать
                </Button>
              }
              {value && record.agrm_id && value.includes("Видеонаблюдение") && (record.blocked != 10) &&
                <Button
                  onClick={(e) => {
                    this.props.syncSvnDom();
                  }}
                >
                  Синхронизировать
                </Button>
              }
            </div>
          )
        }
      },
      {
        title: 'Сумма',
        dataIndex: 'amount',
        key: 'amount',
        // render: (_, record) => {
        //   let full_amount = Number(record.amount)
        //   _forEach(record.addons, (item) => {
        //     full_amount += item.amount
        //   })
        //   return full_amount
        // }
      },
      {
        title: 'Состояние',
        dataIndex: 'blocked',
        key: 'blocked',
        render: (value) => {
          switch (value) {
            case 0:
              return <Tag color={'green'}>Активен</Tag>
            case 10:
              return <Tag color={'volcano'}>Отключен</Tag>
            case 1:
              return <Tag color={'orange'}>Блок. по балансу</Tag>
            case 2:
              return <Tag color={'orange'}>Блок. пользователем</Tag>
            case 3:
              return <Tag color={'orange'}>Блок. администратором</Tag>
            case 4:
              return <Tag color={'orange'}>Блок. по балансу</Tag>
            case 5:
              return <Tag color={'orange'}>Лимит трафика</Tag>
          }
        }
      },
      {
        title: 'Подключен',
        dataIndex: 'acc_ondate',
        key: 'acc_ondate',
        // width: '15%',
        render: (value) => {
          return (
            <span>
              {value && dayjs(value).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          );
        },
      },
      {
        title: 'Отключен',
        dataIndex: 'acc_offdate',
        key: 'acc_offdate',
        // width: '15%',
        render: (value) => {
          return (
            <span>
              {value && dayjs(value).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          );
        },
      },
      {
        title: 'Изменен',
        dataIndex: 'last_mod_date',
        key: 'last_mod_date',
        // width: '15%',
        render: (value) => {
          return (
            <span>
              {value && dayjs(value).format('DD.MM.YYYY HH:mm:ss')}
            </span>
          );
        },
      },
    ]
    return (
      <React.Fragment>
        <Table
          dataSource={tariffs}
          columns={columns}
          rowKey={(record) => record.vg_id}
          size="small"
          bordered={true}
          pagination={false}
          expandable={{
            childrenColumnName: 'addons',
            defaultExpandAllRows: true,
            expandRowByClick: true,
            // rowExpandable: (record) => (record.addons.length > 0),
            showExpandColumn: false,
          }}

        />
      </React.Fragment>
    )
  }
}

export default Tariff
