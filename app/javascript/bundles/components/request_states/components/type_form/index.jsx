import React from 'react';
import Rest from 'tools/rest';
import {
  Form,
  Input,
  InputNumber,
  Button,
} from 'antd';
import { find as _find, forEach as _forEach, map as _map, last as _last } from 'lodash';
import { toast } from 'react-toastify';

class TypeForm extends React.Component {
  state = {
    request_type: {
      id: null,
      name: null,
      alert_timer: {
        h: null,
        m: null,
      },
    },
    errors: null,
  };

  formRef = React.createRef();

  handleCreateNewType = (value) => {
    const hours = value.request_type.alert_timer.h || 0
    const minutes = value.request_type.alert_timer.m || 0
    const request_type = {
      ...value.request_type,
      alert_timer: (hours || minutes) ? hours * 60 + minutes : null
    }
    Rest.post('api/v1/request_types.json', { request_type: request_type })
      .then((response) => {
        const { request_type } = response.data
        this.setState({ request_type: request_type, errors: null });
        toast.success('Сохранено');
        this.props.closer()
      })
      .catch((err) => {
        this.setState({ errors: err.response.data.errors })
        toast.error('Ошибка создания');
      });
  };

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
    const { request_type, errors } = this.state

    let fields = []
    _forEach(request_type, (value, key) => {
      if (key == "alert_timer") {
        _forEach(value, (value, key) => {
          fields = [...fields, {
            name: ["request_type", "alert_timer", key],
            value: value,
          }]
        })

      }
      fields = [...fields, {
        name: ["request_type", key],
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
        onFinish={this.handleCreateNewType}
        onFieldsChange={(changedFields, allFields) => {
          _map(changedFields, (v) => {
            this.setState((prevState) => {
              v.name[1] == 'alert_timer' ?
                prevState.request_type.alert_timer[_last(v.name)] = v.value :
                prevState.request_type[_last(v.name)] = v.value;
              prevState.errors ? prevState.errors[_last(v.name)] = [] : null;
              return prevState;
            })
          })
        }}
      >
        <Form.Item
          name={['request_type', 'name']}
          label="Название:"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Таймер:"
          name={['request_type', 'alert_timer']}
        >
          <React.Fragment>
            <Form.Item
              noStyle
              name={['request_type', 'alert_timer', 'h']}
            >
              <InputNumber style={{ width: '50%' }} addonAfter='ч.' min={0} controls={false} />
            </Form.Item>
            <Form.Item
              noStyle
              name={['request_type', 'alert_timer', 'm']}
            >
              <InputNumber style={{ width: '50%' }} addonAfter='м.' min={0} controls={false} />
            </Form.Item>
          </React.Fragment>
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

export default TypeForm