import React, { useState, useEffect } from 'react';
import Rest from 'tools/rest';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Form, Select, Checkbox } from 'antd';
import { find as _find, forEach as _forEach, map as _map, reject as _reject, values } from 'lodash';
import { toast } from 'react-toastify';

const RuleForm = (props) => {
  const [loading, setLoading] = useState(false);
  const [target_type, setTargetType] = useState(null);
  const [sub_target, setSubTarget] = useState(null);
  const [action, setAction] = useState(null);
  const [fields, setFields] = useState([])

  const [options, setOptions] = useState({
    target_types: props.target_types,
    sub_targets: [],
    actions: [],
    field_options: [],
  })

  useEffect(() => {
    getOptions()
  }, [target_type]);

  const getOptions = () => {
    setLoading(true)
    Rest.get(`/api/v1/notification_rules/get_options`, { params: { target_type: target_type } })
      .then((response) => {
        setOptions(response.data)
        setLoading(false)
      });
  };

  const createRule = () => {
    params = {
      user_id: props.user_id,
      target_type: target_type,
      sub_target_id: sub_target,
      action: action,
      notify_fields: fields,
    }
    setLoading(true)
    Rest.post(`/api/v1/notification_rules.json`, { params: { target_type: target_type } })
      .then((response) => {
        setOptions(response.data)
        setLoading(false)
      });
  };

  return (
    <Form
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
    >
      <Form.Item
        label="Вид объекта:"
      >
        <Select
          options={options.target_types}
          value={target_type}
          onChange={(value) => { setTargetType(value) }}
        />
      </Form.Item>
      <Form.Item
        label="Тип объекта:"
      >
        <Select
          options={options.sub_targets}
          disabled={!(options.sub_targets.length > 0)}
        />
      </Form.Item>
      <Form.Item
        label="Событие:"
      >
        <Select
          options={options.actions}
          disabled={!(options.actions.length > 0)}
        />
      </Form.Item>
      <Form.Item
        label="Поля объекта:"
      >
        <Checkbox.Group
          options={options.field_options}
          disabled={!(options.field_options.length > 0)}
        />
      </Form.Item>
      <Form.Item
        wrapperCol={{ offset: 8, span: 16 }}
      >
        <Button
          style={{ width: '100%' }}
          type='primary'
          htmlType="submit"
        // disabled={!fieldsChanged}
        >
          Сохранить
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RuleForm;
