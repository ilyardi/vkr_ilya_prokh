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
          // if (Object.keys(record.changes).length == 1 && record.changes.comment) return (
          //   <Comment
          //     author={`${record.whodunnit} оставил(-а) комментарий`}
          //     content={
          //       <React.Fragment>
          //         <Text>{record.changes.comment} </Text>
          //         <br />
          //       </React.Fragment>
          //     }
          //     datetime={format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm')}
          //   />
          // );
          return (
            <Comment
              author={`${record.whodunnit} ${value == 'create' ? 'создал(-а) задачу' : 'изменил(-а) задачу'}`}
              content={
                <React.Fragment>
                  {_map(record.changes, (value, key) => {
                    let field_name = ''
                    let field_value = value
                    switch (key) {
                      case 'status':
                        field_name = "Статус: "
                        break;
                      case 'description':
                        field_name = "Описание: "
                        break;
                      case 'phone':
                        field_name = "Телефон: "
                        break;
                      case 'subject':
                        field_name = "Тип: "
                        break;
                      case 'user':
                        field_name = "Исполнитель: "
                        break;
                      case 'agreement':
                        field_name = "Договор: "
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
