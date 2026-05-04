import React, { useState } from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { toast } from 'react-toastify';
import Rest from 'tools/rest';

const SubscriberForm = (props) => {
  const [subscriberParams, setSubscriberParams] = useState({
    name: '',
    last: '',
    patronymic: '',
    phone: '',
    owner: false,
  });

  const [errors, setErrors] = useState({});

  const close = () => props.onClose();

  const createSubscriber = () => {
    const params = {
      number: props.agrmNumber,
      subscriber: {
        ...subscriberParams,
        strict_mode: true,
      },
    };

    Rest.post(`/api/teledom/agreements/add_subscriber.json`, params)
      .then(() => {
        toast.success("Подписчик добавлен");
        close();
      })
      .catch((e) => {
        setErrors(e.response?.data?.errors || {});
        toast.error("Ошибка добавления");
      });
  };

  return (
    <Modal
      title="Новый подписчик"
      open={props.showSubscriberForm}
      onCancel={close}
      onOk={createSubscriber}
      centered
      width="95%"
      style={{ top: 10 }}
      bodyStyle={{ padding: "10px 5px" }}
    >
      <Form layout="vertical">

        <Form.Item
          label="Фамилия"
          validateStatus={errors?.last && "error"}
          help={errors?.last}
        >
          <Input
            placeholder="Введите фамилию"
            value={subscriberParams.last}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, last: e.target.value });
              setErrors({});
            }}
          />
        </Form.Item>

        <Form.Item
          label="Имя"
          validateStatus={errors?.name && "error"}
          help={errors?.name}
        >
          <Input
            placeholder="Введите имя"
            value={subscriberParams.name}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, name: e.target.value });
              setErrors({});
            }}
          />
        </Form.Item>

        <Form.Item
          label="Отчество"
          validateStatus={errors?.patronymic && "error"}
          help={errors?.patronymic}
        >
          <Input
            placeholder="Введите отчество"
            value={subscriberParams.patronymic}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, patronymic: e.target.value });
              setErrors({});
            }}
          />
        </Form.Item>

        <Form.Item
          label="Телефон"
          validateStatus={errors?.phone && "error"}
          help={errors?.phone}
        >
          <Input
            placeholder="+7XXXXXXXXXX"
            value={subscriberParams.phone}
            onChange={(e) => {
              setSubscriberParams({ ...subscriberParams, phone: e.target.value });
              setErrors({});
            }}
          />
        </Form.Item>

        <Form.Item label="Владелец">
          <Switch
            checkedChildren="Да"
            unCheckedChildren="Нет"
            checked={subscriberParams.owner}
            onChange={(checked) => {
              setSubscriberParams({ ...subscriberParams, owner: checked });
              setErrors({});
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubscriberForm;
