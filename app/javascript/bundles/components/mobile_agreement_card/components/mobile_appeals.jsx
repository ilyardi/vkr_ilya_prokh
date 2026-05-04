import React from 'react';
import { List } from 'antd-mobile';
import dayjs from 'dayjs';

class Appeals extends React.Component {
  render() {
    const data = this.props.appeals || [];

    return (
      <List header="Обращения">
        {data.map((item) => (
          <List.Item key={item.id}>
            <div>
              <strong>Менеджер:</strong> {item.lb_manager} <br />
              <strong>Причина:</strong> {item.call_reason} <br />
              <strong>Дата:</strong> {item.date ? dayjs(item.date).format('DD.MM.YYYY HH:mm:ss') : '-'}
            </div>
          </List.Item>
        ))}
      </List>
    );
  }
}

export default Appeals;
