import React from 'react';
import Rest from 'tools/rest';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Checkbox,
  Radio,
  Typography,
} from 'antd';
import { find as _find, forEach as _forEach, map as _map, last as _last } from 'lodash';
import { toast } from 'react-toastify';

class ReasonForm extends React.Component {
  state = {
    request_reason: {
      description: null,
      service_type: null,
      service_location: null,
    },
    errors: null,
  };

  constructor(props) {
    super(props);

    if (props.request_reason) {
      this.state = {
        request_reason: props.request_reason
      };
    }
  }

  formRef = React.createRef();

  handleCreateNewReason = (value) => {
    const { request_reason } = this.state
    Rest.post('api/v1/request_reasons.json', { request_reason: request_reason })
      .then((response) => {
        toast.success('Сохранено');
        this.props.closer()
      })
      .catch((err) => {
        this.setState({ errors: err.response.data.errors })
        toast.error('Ошибка создания');
      });
  };

  handleUpdateReason = (value) => {
    const { request_reason } = this.state
    Rest.put(`/api/v1/request_reasons/${this.state.request_reason.id}.json`, { request_reason: request_reason }).then(
      (response) => {
        toast.success('Сохранено!');
        this.props.closer()
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка сохранения!');
      })
  };

  handleSaveReason = this.props.request_reason ? this.handleUpdateReason : this.handleCreateNewReason

  onReset = () => {
    this.formRef.current.resetFields();
  };

  handleOk = () => {
    this.formRef.current.submit();
  };

  handleCancel = () => {
    this.onReset();
    this.props.closer();
  };

  render() {
    const { request_reason, errors } = this.state

    let fields = []
    _forEach(request_reason, (value, key) => {
      fields = [...fields, {
        name: ["request_reason", key],
        value: value,
        errors: errors ? errors[key] : [],
      }]
    })

    return (
      <Form
        fields={fields}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ paddingTop: 12 }}
        ref={this.formRef}
        onFinish={this.handleSaveReason}
        onFieldsChange={(changedFields, allFields) => {
          _map(changedFields, (v) => {
            this.setState((prevState) => {
              prevState.request_reason[_last(v.name)] = v.value;
              prevState.errors ? prevState.errors[_last(v.name)] = [] : null;
              return prevState;
            })
          })
        }}
      >
        <Form.Item
          name={['request_reason', 'description']}
          label="Название:"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={['request_reason', 'service_type']}
          label="Вид услуг:"
        >
          <Radio.Group>
            <Radio value="tv">ТВ</Radio>
            <Radio value="internet">ИНТ</Radio>
            <Radio value="int_tv">ТВ + ИНТ</Radio>
            <Radio value="other">Другое</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name={['request_reason', 'service_location']}
          label="Локализация:"
        >
          <Radio.Group>
            <Radio value="abonent">Абонент</Radio>
            <Radio value="operator">Оператор</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item wrapperCol={{ span: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '70%', margin: "0 auto" }}>
            <Button key="submit" type="primary" onClick={this.handleOk}>
              Сохранить
            </Button>
            <Button key="decline" onClick={this.handleCancel}>
              Отмена
            </Button>
          </div>
        </Form.Item>
      </Form >
    )
  }
}

export default ReasonForm