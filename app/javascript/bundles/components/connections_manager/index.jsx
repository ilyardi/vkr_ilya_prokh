import React, { Component } from 'react';
import Rest from 'tools/rest';
import { debounce, isEqual as _isEqual, replace as _replace, map as _map } from 'lodash';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { AbilityContext } from 'tools/ability';
import { Typography, Popover, Button } from 'antd';
import { ApiFilled } from '@ant-design/icons';
import { parseISO as _parseISO, format } from 'date-fns';
import ConnectionList from 'components/connection_list';

const { Text } = Typography;

class ConnnectionsManager extends Component {
  state = {
    connections: this.props.connections || [],
    agrm_id: this.props.agrm_id,
    loading: false,
  };

  componentDidMount() {
    if (this.props.reload_data) {
      this.loadConnections()
    }
  };

  loadConnections() {
    const { agrm_id } = this.state;
    this.setState({ loading: true });
    Rest.post(`/api/v1/agreements/${agrm_id}/connections.json`)
      .then((response) => {
        const { connections, errors } = response.data;
        this.change_connections(connections);
        if (errors) {
          toast.error('Ошибка при проверке сетевого соединения абонента');
        }
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  change_connections = (connections) => {
    this.setState({ connections });
  };

  render() {
    const { connections, agrm_id } = this.state;
    const first_connection = connections[0];
    let connection_state = 'unknown';
    let checked_at = '';
    if (first_connection) {
      connection_state = first_connection.p_state;
      checked_at = first_connection.checked_at
        ? dayjs(first_connection.checked_at).format('DD.MM.YYYY')
        : '';
    }
    let indicate_colore = 'red';
    switch (connection_state) {
      case ('unknown', 'redirect'):
        indicate_colore = 'orange';
        break;
      case 'up':
        indicate_colore = 'green';
        break;
      case 'down':
        indicate_colore = 'red';
        break;
    }
    return (
      <Popover
        placement="left"
        title={'Настройка оборудования'}
        content={
          <ConnectionList connections={connections} change_connections={this.change_connections} />
        }
        trigger="click"
      >
        <Button
          icon={<ApiFilled style={{ color: indicate_colore }} />}
          loading={this.state.loading}
          shape="round"
        >
          <Text style={{ fontSize: '12px' }}>{checked_at}</Text>
        </Button>
      </Popover>
    );
  }
}

ConnnectionsManager.contextType = AbilityContext;

export default ConnnectionsManager;
