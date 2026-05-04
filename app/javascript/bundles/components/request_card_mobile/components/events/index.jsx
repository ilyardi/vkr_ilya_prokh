import React from 'react';
import {
  List,
  Avatar,
  message,
  Typography,
  Table,
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { find as _find, forEach as _forEach, map as _map, last as _last, isEqual as _isEqual } from 'lodash';
import { parseISO as _parseISO, format } from 'date-fns';

const { Text } = Typography;

class Events extends React.Component {
  state = {
    events: this.props.events || [],
  };

  componentDidUpdate(prevProps) {
    if (prevProps.events.length !== this.props.events.length) {
      const { events } = this.props
      this.setState({ events })
    }
  }

  render() {
    const { events } = this.state

    const columns = [
      {
        dataIndex: 'event',
        key: 'event',
        render: (value, record) => {
          if (Object.keys(record.changes).length == 1 && record.changes.comment) return (
            <Comment
              author={`${record.whodunnit} оставил(-а) комментарий`}
              content={
                <React.Fragment>
                  <Text>{record.changes.comment} </Text>
                  <br />
                </React.Fragment>
              }
            />
          );
          return (
            <Comment
              author={`${record.whodunnit} ${value == 'create' ? 'создал(-а) задачу' : 'изменил(-а) задачу'}`}
              content={
                <React.Fragment>
                  {record.changes.id &&
                    <React.Fragment>
                      <Text>Номер: {record.changes.id} </Text>
                      <br />
                    </React.Fragment>}
                  {record.changes.request_type &&
                    <React.Fragment>
                      <Text>Тип: {record.changes.request_type} </Text>
                      <br />
                    </React.Fragment>}
                  {record.changes.request_status &&
                    <React.Fragment>
                      <Text>Статус: {record.changes.request_status}</Text><br />
                    </React.Fragment>}
                  {record.changes.request_reason &&
                    <React.Fragment>
                      <Text>Причина обращения: {record.changes.request_reason}</Text><br />
                    </React.Fragment>}
                  {record.changes.request_first_reason &&
                    <React.Fragment>
                      <Text>Причина обращения: {record.changes.request_first_reason}</Text><br />
                    </React.Fragment>}
                  {record.changes.description &&
                    <React.Fragment>
                      <Text>Описание: {record.changes.description}</Text><br />
                    </React.Fragment>}
                  {record.changes.responsible_user &&
                    <React.Fragment>
                      <Text>Автор: {record.changes.responsible_user}</Text><br />
                    </React.Fragment>}
                  {record.changes.executor_user &&
                    <React.Fragment>
                      <Text>Исполнитель: {record.changes.executor_user}</Text><br />
                    </React.Fragment>}
                  {record.changes.plan_started_at &&
                    <React.Fragment>
                      <Text>Дата начала: {format(_parseISO(record.changes.plan_started_at), 'dd.MM.yyyy HH:mm')}</Text><br />
                    </React.Fragment>}
                  {record.changes.plan_finished_at &&
                    <React.Fragment>
                      <Text>Дата завершения: {format(_parseISO(record.changes.plan_finished_at), 'dd.MM.yyyy HH:mm')}</Text><br />
                    </React.Fragment>}
                  {record.changes.resource_identifier &&
                    <React.Fragment>
                      <Text>Закреплена за {record.changes.resource_type == 'LbAgreement' ? 'договором' : 'оборудованием'} -> {record.changes.resource_identifier}</Text><br />
                    </React.Fragment>
                  }
                  {record.changes.work_type &&
                    <React.Fragment>
                      <Text>Тип работ: {record.changes.work_type == 'inside' ? 'внутренние' : 'внешние'}</Text><br />
                    </React.Fragment>
                  }
                  {record.changes.comment &&
                    <React.Fragment>
                      <Text>Комментарий: {record.changes.comment} </Text>
                      <br />
                    </React.Fragment>}
                </React.Fragment>
              }
              datetime={format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm')}
            />
          )
        }
      },
    ]

    return (
      <Table
        showHeader={false}
        dataSource={events}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={false}
        scroll={{
          y: 500,
        }}
      />
    )
  };
}

export default Events
