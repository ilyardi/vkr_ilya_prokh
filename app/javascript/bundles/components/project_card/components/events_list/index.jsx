import React from 'react';
import {
  List,
  Avatar,
  message,
  Typography,
  Table,
  Card,
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { find as _find, forEach as _forEach, map as _map, last as _last, isEqual as _isEqual } from 'lodash';
import { parseISO as _parseISO, format } from 'date-fns';
import { withStyles } from '@material-ui/core/styles';
import { red, volcano, green, yellow } from '@ant-design/colors';

const { Text } = Typography;

class EventList extends React.Component {
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
          if (Object.keys(record.changes).length == 1 && record.changes.comment)
            return (
              <Card
                size="small"
                title={`Комментарий к ${record.item_type == 'Project' ? 'проекту' : 'задаче'} ${record.item_type == 'Request' ? `№ ${record.item_id}` : ''}`}
                style={{ borderRadius: '10px' }}
                className={this.props.classes['success']}
              >
                <Text>{`${record.whodunnit} оставил(-а) комментарий: `}</Text>
                <Text>{record.changes.comment} </Text>
              </Card >
            );
          return (
            <Comment
              author={`${record.whodunnit} ${format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm')} ${record.item_type == 'Project' ? 'проект' : `задача № ${record.item_id}`}`}
              content={
                <React.Fragment>
                  {_map(record.changes, (value, key) => {
                    let field_name = ''
                    let field_value = value
                    switch (key) {
                      case 'id':
                        field_name = "Номер: "
                        break;
                      case 'project_type':
                        field_name = "Тип: "
                        break;
                      case 'project_status':
                        field_name = "Статус: "
                        break;
                      case 'request_type':
                        field_name = "Тип: "
                        break;
                      case 'request_subtype':
                        field_name = "Подтип: "
                        break;
                      case 'request_status':
                        field_name = "Статус: "
                        break;
                      case 'request_reason':
                        field_name = "Причина обращения: "
                        break;
                      case 'description':
                        field_name = "Описание: "
                        break;
                      case 'responsible_user':
                        field_name = "Автор: "
                        break;
                      case 'project_managers':
                        field_name = "МП: "
                        break;
                      case 'executor_user':
                        field_name = "Исполнитель: "
                        break;
                      case 'plan_started_at':
                        field_name = "Дата начала: "
                        field_value = record.changes.plan_started_at ? format(_parseISO(record.changes.plan_started_at), 'dd.MM.yyyy HH:mm') : null
                        break;
                      case 'plan_finished_at':
                        field_name = "Дата завершения: "
                        field_value = record.changes.plan_finished_at ? format(_parseISO(record.changes.plan_finished_at), 'dd.MM.yyyy HH:mm') : null
                        break;
                      case 'resource_identifier':
                        field_name = `Добавлена в проект -> `
                        break;
                      case 'comment':
                        field_name = "Комментарий: "
                        break;
                      default:
                        field_name = null
                    }
                    if (field_name) {
                      return (
                        <React.Fragment key={key}>
                          <Text>{field_name + field_value}</Text>
                          <br />
                        </React.Fragment>
                      )
                    }
                  })}
                </React.Fragment>
              }
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
          y: 700,
        }}
      />
    )
  };
}

const styles = (theme) => ({
  danger: {
    backgroundColor: red[1],
  },
  warning: {
    backgroundColor: yellow[1],
  },
  success: {
    backgroundColor: green[1],
  },
  error: {
    backgroundColor: volcano[1],
  },
});

export default withStyles(styles)(EventList)
