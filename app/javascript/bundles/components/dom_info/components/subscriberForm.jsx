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
  Switch,
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

const SubscriberForm = (props) => {
  const [subscriberParams, setSubscriberParams] = useState({
    name: null,
    patronymic: null,
    last: null,
    phone: null,
    owner: false,
  });
  const [errors, setErrors] = useState({})

  const closeModal = () => {
    props.onClose()
  };

  const createSubscriber = () => {
    const params = {
      number: props.agrmNumber,
      subscriber: {
        name: subscriberParams.name,
        patronymic: subscriberParams.patronymic,
        last: subscriberParams.last,
        phone: subscriberParams.phone,
        owner: subscriberParams.owner,
        strict_mode: true,
      }
    }
    Rest.post(`/api/teledom/agreements/add_subscriber.json`, params).then(
      (response) => {
        const { dom } = response.data
        toast.success('Подписчик');
        closeModal();
      }).catch((e) => {
        console.error('error', e);
        if (e.response.data) {
          setErrors(e.response.data?.errors)
        }
        toast.error('Ошибка добавления подписчика');
      })
  };

  return (
    <Modal
      title='Новый подписчик'
      open={props.showSubscriberForm}
      onCancel={closeModal}
      onOk={createSubscriber}
    >
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="Фамилия"
          help={errors?.last}
          validateStatus={errors?.last && "error"}
        >
          <Input
            value={subscriberParams.last}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, last: e.target.value })
              setErrors({})
            }}
          />
        </Form.Item>
        <Form.Item
          label="Имя"
          help={errors?.name}
          validateStatus={errors?.name && "error"}
        >
          <Input
            value={subscriberParams.name}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, name: e.target.value })
              setErrors({})
            }}
          />
        </Form.Item>
        <Form.Item
          label="Отчество"
          help={errors?.patronymic}
          validateStatus={errors?.patronymic && "error"}
        >
          <Input
            value={subscriberParams.patronymic}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, patronymic: e.target.value })
              setErrors({})
            }}
          />
        </Form.Item>
        <Form.Item
          label="Телефон"
          help={errors?.phone}
          validateStatus={errors?.phone && "error"}
        >
          <Input
            value={subscriberParams.phone}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, phone: e.target.value })
              setErrors({})
            }}
          />
        </Form.Item>
        <Form.Item
          label="Владелец"
          help={errors?.owner}
          validateStatus={errors?.owner && "error"}
        >
          <Switch
            checkedChildren="Да"
            unCheckedChildren="Нет"
            checked={subscriberParams.owner}
            onChange={(checked) => {
              setSubscriberParams({ ...subscriberParams, owner: checked })
              setErrors({})
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubscriberForm
