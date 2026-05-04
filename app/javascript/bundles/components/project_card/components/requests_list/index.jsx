import React from 'react';
import Rest from 'tools/rest';
import {
  Avatar,
  message,
  Typography,
  Table,
  Card,
  Button,
  Modal,
  Form,
  Select,
} from 'antd';
import { Comment } from '@ant-design/compatible';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { find as _find, forEach as _forEach, map as _map, last as _last, isEqual as _isEqual } from 'lodash';
import { parseISO as _parseISO, format } from 'date-fns';
import RequestCard from 'components/request_card'

const { Text } = Typography;

class RequestsList extends React.Component {
  state = {
    project_id: this.props.project_id,
    requests: [],
    request: null,
    visibleRequestCard: false,
    order: 'asc',
    order_by: 'created_at',
    data_relevance: null,
  };

  order_by_list = [
    { label: 'дате создания', value: 'created_at' },
    { label: 'дате начала', value: 'plan_started_at' },
  ]

  loadRequests = () => {
    if (!this.props.project_id) {return}
    const params = {
      search: {project_id: this.state.project_id},
      order: this.state.order,
      order_by: this.state.order_by,
    };
    if (this.loadRequest) this.loadRequest.cancel();
    this.setState({ loading: true });
    this.loadRequest = Rest.get('/api/v1/requests.json', { params: params }).then((response) => {
      const { requests } = response.data;
      this.setState({
        requests
      });
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });
  };

  componentDidMount() {
    this.loadRequests();
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.order !== this.state.order ||
      prevState.order_by !== this.state.order_by ||
      prevState.data_relevance !== this.state.data_relevance
    ) {
      this.loadRequests()
    }
  }

  closerModalRequest = () => {
    this.setState({
      visibleRequestCard: false,
      data_relevance: new Date(),
    });
  };

  render() {
    const { requests, request, visibleRequestCard } = this.state

    const columns = [
      {
        dataIndex: 'request',
        key: 'request',
        render: (value, record) => {
          return (
            <Card
              size="small"
              title={`Задача № ${record.id}, ${record.request_type?.name}`}
              style={{ borderRadius: '10px' }}
              onClick={() => {
                this.setState({
                  request: record,
                  visibleRequestCard: true,
                })
              }}
            >
              <p>
                <b>Статус:</b> {record.request_status?.name} | <b>Сроки:</b> {
                record.plan_started_at ? format(_parseISO(record.plan_started_at), 'dd.MM.yyyy HH:mm') : ''} --- {
                record.plan_finished_at ? format(_parseISO(record.plan_finished_at), 'dd.MM.yyyy HH:mm') : ''}
              </p>
              <p>
                <b>Описание:</b> {record.description ? record.description.slice(0, 180) + '...' : null}
              </p>
            </Card >
          )
        }
      },
    ]

    return (
      <React.Fragment>
        {visibleRequestCard &&
          <Modal
            title={`Задача`}
            visible={visibleRequestCard}
            onCancel={this.closerModalRequest}
            onOk={this.closerModalRequest}
            footer={false}
            width={'80%'}
          >
            {request ?
              <RequestCard request_id={request.id} />
              :
              <RequestCard project_id={this.props.project_id} />
            }
          </Modal>
        }
        <Button
          name='create_request'
          style={{ width: '90%', borderRadius: '15px', margin: '0 auto 10px', display: 'block' }}
          onClick={() => this.setState({ visibleRequestCard: true, request: null })}
          icon={<PlusOutlined />}
        />
        <Text style={{marginLeft: '20px'}}>Сортировка по:</Text>
        <Select
          value={this.state.order_by}
          options={this.order_by_list}
          onChange={(value) => { this.setState({ order_by: value }) }}
          style={{margin: '10px 10px'}}
        />
        <Text>по:</Text>
        <Select
          value={this.state.order}
          onChange={(value) => { this.setState({ order: value }) }}
          style={{ margin: '10px 10px' }}
        >
          <Select.Option value={'asc'}>возрастанию</Select.Option>
          <Select.Option value={'desc'}>убыванию</Select.Option>
        </Select>
        <Table
          showHeader={false}
          dataSource={requests}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={false}
          scroll={{
            y: 700,
          }}
        />
      </React.Fragment>
    )
  };
}

export default RequestsList
