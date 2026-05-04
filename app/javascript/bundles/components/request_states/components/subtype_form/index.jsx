import React from 'react';
import Rest from 'tools/rest';
import {
  Form,
  Input,
  Button,
} from 'antd';
import { find as _find, forEach as _forEach, map as _map, last as _last } from 'lodash';
import { toast } from 'react-toastify';

class SubtypeForm extends React.Component {
  state = {
    request_subtype: {
      name: null,
      request_type_id: this.props.request_type_id,
    },
    errors: null,
  };

  formRef = React.createRef();

  handleCreateNewSubtype = (value) => {
    const { request_subtype } = this.state
    Rest.post('api/v1/request_subtypes.json', { request_subtype: request_subtype })
      .then((response) => {
        const { request_subtype } = response.data
        this.setState({ request_subtype: request_subtype, errors: null });
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
    const { request_subtype, errors } = this.state

    let fields = []
    _forEach(request_subtype, (value, key) => {
      fields = [...fields, {
        name: ["request_subtype", key],
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
        onFinish={this.handleCreateNewSubtype}
        onFieldsChange={(changedFields, allFields) => {
          _map(changedFields, (v) => {
            this.setState((prevState) => {
              prevState.request_subtype[_last(v.name)] = v.value;
              prevState.errors ? prevState.errors[_last(v.name)] = [] : null;
              return prevState;
            })
          })
        }}
      >
        <Form.Item
          name={['request_subtype', 'name']}
          label="Название:"
        >
          <Input />
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

export default SubtypeForm