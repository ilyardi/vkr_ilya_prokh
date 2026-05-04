import React, { useState, useEffect, useContext } from 'react';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  Button,
  Typography,
  Form,
  Input,
  Modal,
} from 'antd';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const KeyForm = (props) => {
  const [keyParams, setKeyParams] = useState({
    rfId: null,
    comments: null,
  });
  const [errors, setErrors] = useState({})

  const closeModal = () => {
    props.onClose()
  };

  const saveKey = () => {
    const params = {
      key: keyParams.rfId,
      message: keyParams.comments,
      number: props.agrmNumber,
    }
    Rest.post(`/api/teledom/agreements/add_key.json`, params).then(
      (response) => {
        toast.success('Ключ создан');
        closeModal();
      }).catch((e) => {
        setErrors(e.response.data.errors)
        toast.error('Ошибка создания ключа');
      })
  };
  return (
    <Modal
        title='Новый ключ'
        open={props.showKeyForm}
        onCancel={closeModal}
        onOk={saveKey}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="ID"
            help={errors?.key}
            validateStatus={errors?.key && "error"}
          >
            <Input
              value={keyParams.rfId}
              onChange={(e) => {
                setKeyParams({ ...keyParams, rfId: e.target.value })
                setErrors({})
              }}
            />
          </Form.Item>
          <Form.Item
            label="Комментарий"
            help={errors?.comments}
            validateStatus={errors?.comments && "error"}
          >
            <TextArea
              rows={2}
              value={keyParams.comments}
              onChange={(e) => {
                setKeyParams({ ...keyParams, comments: e.target.value })
                setErrors({})
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
  );
};

export default KeyForm
