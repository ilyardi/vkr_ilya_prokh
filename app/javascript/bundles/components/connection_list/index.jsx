import React, { Component } from 'react';
import Rest from 'tools/rest';
import { isEqual as _isEqual, replace as _replace, map as _map, values } from 'lodash';
import dayjs from 'dayjs';
import { AbilityContext } from 'tools/ability';
import { List, Switch, Button, Row, Col, Typography, Radio, Popover } from 'antd';
import { Comment } from '@ant-design/compatible';
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SettingOutlined,
  ApiFilled,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import Preloader from 'components/preloader';

const { Text, Title } = Typography;

class ConnectionList extends Component {
  state = {
    connections: this.props.connections,
    loading: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (!_isEqual(prevProps.connections, this.props.connections)) {
      this.setState({ connections: this.props.connections });
    }
  }

  check_port_state = (port_id) => {
    this.setState({ loading: true });
    Rest.put(`/api/v1/ports/${port_id}/check_port_state.json`)
      .then((response) => {
        const { port } = response.data;
        const new_connections = _map(this.state.connections, (value) => {
          if (value.p_id == port.id) {
            value.p_state = port.state;
            value.checked_at = port.checked_at;
          }
          return value;
        });
        toast.success('Изменения сохранены');
        this.change_connections(new_connections);
      })
      .catch((e) => {
        console.error('error', e);
        toast.error('Ошибка подключения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  change_port_state = (port_id, state) => {
    this.setState({ loading: true });

    Rest.put(`/api/v1/ports/${port_id}.json`, { state: state })
      .then((response) => {
        const { port } = response.data;
        const new_connections = _map(this.state.connections, (value) => {
          if (value.p_id == port.id) {
            value.p_state = port.state;
          }
          return value;
        });
        toast.success('Изменения сохранены');
        this.change_connections(new_connections);
      })
      .catch((e) => {
        console.error('error', e);
        toast.error('Ошибка подключения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  change_connections = (connections) => {
    if (this.props.change_connections) {
      this.props.change_connections(connections);
      return;
    }
    this.setState({ connections });
  };

  render() {
    const { connections } = this.state;
    return (
      <Preloader loading={this.state.loading}>
        <List
          dataSource={connections}
          renderItem={(item) => (
            <List.Item>
              <Row gutter={[16]}>
                <Col>
                  <Radio.Group
                    optionType="button"
                    buttonStyle="solid"
                    options={['up', 'down', 'redirect']}
                    value={item.p_state}
                    onChange={(e) => {
                      this.change_port_state(item.p_id, e.target.value);
                    }}
                    disabled={!this.context.can('update', 'Port')}
                  />
                  <br />
                  <br />
                  IP: <Text strong>{item.ip}</Text>
                  <br />
                  Оборудование: <Text strong>{item.dv_name}</Text>
                  <br />
                  Оборудование IP: <Text strong>{item.dv_ip}</Text>
                  <br />
                  Номер порта: <Text strong>{item.p_number}</Text>
                  <br />
                  Состояние: <Text strong>{item.p_state}</Text>
                  <Popover
                    placement="left"
                    title={'Настройка оборудования'}
                    content={
                      <List
                        dataSource={item.changes}
                        renderItem={(change) => (
                          <List.Item>
                            <Comment
                              author={`${change.user}`}
                              content={ <Text>{change.state_change}</Text> }
                              datetime={dayjs(change.date).format('DD.MM.YYYY HH:mm:ss')}
                              style={{paddingBlock: '0px'}}
                            />
                          </List.Item>
                        )}
                      />
                    }
                    trigger='hover'
                  >
                    <i> история изменений</i>
                  </Popover>
                  <br />
                  Дата обновления:{' '}
                  <Text strong>
                    {item.checked_at ? dayjs(item.checked_at).format('DD.MM.YYYY HH:mm:ss') : ''}
                  </Text>
                </Col>
                <Col>
                  <Button
                    onClick={(event) => {
                      this.check_port_state(item.p_id);
                    }}
                    disabled={!this.context.can('check_port_state', 'Port')}
                  >
                    Обновить
                  </Button>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Preloader>
    );
  }
}

ConnectionList.contextType = AbilityContext;

export default ConnectionList;
