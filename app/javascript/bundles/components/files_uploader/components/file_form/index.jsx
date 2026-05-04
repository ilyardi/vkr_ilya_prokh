import React, { useState, useEffect, useReducer } from 'react';
import Rest from 'tools/rest';
import { Button, message, Modal, Table, Typography, Form } from 'antd';
import { FolderAddOutlined } from '@ant-design/icons';
import { find as _find, forEach as _forEach, map as _map, findIndex as _findIndex } from 'lodash';
import { toast } from 'react-toastify';

const { Text } = Typography;

const FileForm = (props) => {

  return (
    <Form
      // onFinish={handleUploadFile}
      style={{ marginTop: "30px" }}
      layout="vertical"
    >
      <Form.Item
        name='name'
        label='Название:'
      >
        <Input />
      </Form.Item>
      <Form.Item>
        <Button style={{ display: 'block', width: '150px', margin: '0 auto' }} type="primary" htmlType="submit">
          Сохранить
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FileForm;
