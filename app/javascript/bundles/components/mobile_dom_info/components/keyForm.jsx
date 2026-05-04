import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import Rest from 'tools/rest';

const { TextArea } = Input;

const KeyForm = (props) => {
  const [keyParams, setKeyParams] = useState({
    rfId: '',
    comments: '',
  });

  const [errors, setErrors] = useState({});

  const close = () => props.onClose();

  const saveKey = () => {
    const params = {
      key: keyParams.rfId,
      message: keyParams.comments,
      number: props.agrmNumber,
    };

    Rest.post(`/api/teledom/agreements/add_key.json`, params)
      .then(() => {
        toast.success("Ключ создан");
        close();
      })
      .catch((e) => {
        setErrors(e.response.data.errors || {});
        toast.error("Ошибка создания ключа");
      });
  };

  return (
    <Modal
      title="Новый ключ"
      open={props.showKeyForm}
      onCancel={close}
      onOk={saveKey}
      centered
      width="95%"
      style={{ top: 10 }}
      bodyStyle={{ padding: "10px 5px" }}
    >
      <Form layout="vertical">
        <Form.Item
          label="ID ключа"
          validateStatus={errors?.key && "error"}
          help={errors?.key}
        >
          <Input
            placeholder="Например: 03A1B4C92E"
            value={keyParams.rfId}
            onChange={(e) => {
              setKeyParams({ ...keyParams, rfId: e.target.value });
              setErrors({});
            }}
          />
        </Form.Item>

        <Form.Item
          label="Комментарий"
          validateStatus={errors?.comments && "error"}
          help={errors?.comments}
        >
          <TextArea
            rows={3}
            placeholder="Например: ключ от главного входа"
            value={keyParams.comments}
            onChange={(e) => {
              setKeyParams({ ...keyParams, comments: e.target.value });
              setErrors({});
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default KeyForm;
