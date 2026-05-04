import React from 'react';
import Rest from 'tools/rest';
import {
  Tabs,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  Form,
  Typography,
  Space,
  InputNumber,
  message,
  Empty,
  List,
  Modal,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { debounce, find as _find, forEach as _forEach, map as _map, last as _last, replace as _replace } from 'lodash';
import { toast } from 'react-toastify';
import Preloader from 'components/preloader';
import './index.css';
import ReasonForm from './components/reason_form';

const { Text } = Typography;

class RequestReasons extends React.Component {
  state = {
    request_reasons: [],
    request_reason: null,
    data_relevant: false,
    visible_modal_reason: false,
    loading: false,
  };

  componentDidMount() {
    this.loadReasons()
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.data_relevant !== this.state.data_relevant &&
      !this.state.data_relevant
    ) {
      this.loadReasons();
    }
  };

  loadReasons() {
    this.setState({ loading: true });
    Rest.get(`/api/v1/request_reasons.json`).then(
      (response) => {
        const { request_reasons } = response.data
        this.setState({ request_reasons })

      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false, data_relevant: true });
      });
  };

  handleDeleteReason = (request_reason_id) => {
    Rest.delete(`/api/v1/request_reasons/${request_reason_id}.json`).then(
      (response) => {
        const { success } = response.data
        this.setState({ data_relevant: false })
        toast.success('Удалено!');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка удаления!');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleOpenReasonSettings = (request_reason) => {
    this.setState({
      request_reason: request_reason,
      visible_modal_reason: true,
    })
  }

  render() {

    const {
      loading,
      request_reasons,
      request_reason,
      visible_modal_reason,
      data_relevant,
    } = this.state

    const columns = [
      {
        title: 'Название',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Вид услуг',
        dataIndex: 'service_type',
        key: 'service_type',
        width: '20%',
      },
      {
        title: 'Локализация',
        dataIndex: 'service_location',
        key: 'service_location',
        width: '20%',
      },
      {
        title: '',
        dataIndex: 'action',
        key: 'action',
        width: '100px',
        render: (_, record) => {
          return (
            <React.Fragment>
              <Button icon={<SettingOutlined />} onClick={(event) => this.handleOpenReasonSettings(record)} />
              <Button style={{ marginLeft: '10px' }} icon={<DeleteOutlined />} onClick={(event) => this.handleDeleteReason(record.id)} />
            </React.Fragment>
          )
        }
      },
    ];

    const scroll_size = 400
    return (
      <Preloader loading={loading}>
        {visible_modal_reason &&
          <Modal
            title={`Добавить`}
            visible={visible_modal_reason}
            onCancel={() => { this.setState({ visible_modal_reason: false }) }}
            onOk={() => { this.setState({ visible_modal_reason: false }) }}
            footer={false}
            width={'30%'}
          >
            <ReasonForm
              closer={() => { this.setState({ visible_modal_reason: false, data_relevant: false, request_reason: null }) }}
              request_reason={request_reason}
            />
          </Modal>}
        <React.Fragment>
          <Table
            title={() =>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Причины</Text>
                <Button
                  name='add_reason'
                  style={{ width: '50px', borderRadius: '25px' }}
                  onClick={() => { this.setState({ visible_modal_reason: true }) }}
                  icon={<PlusOutlined />}
                />
              </div>}
            dataSource={request_reasons}
            columns={columns}
            rowKey={(record) => record.id}
            pagination={false}
            scroll={{
              y: scroll_size,
            }}
            size="small"
            bordered={false}
          />
        </React.Fragment>
      </Preloader >
    );
  }
}

export default RequestReasons
