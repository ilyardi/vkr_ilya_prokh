import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  ColorPicker,
  Button,
  message,
  Modal,
  Typography,
  Form,
  Input,
  DatePicker,
  Tag,
  Select,
} from 'antd';
import { RetweetOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
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
const { RangePicker } = DatePicker;

const FormAdd = (props) => {

  const [searchTemplate, setSearchTemplate] = useState({
    name: null,
    color: "green",
  });
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false);

  const tag_colors = [
    {value: 'red', label: 'red'},
    {value: 'magenta', label: 'magenta'},
    {value: 'volcano', label: 'volcano'},
    {value: 'orange', label: 'orange'},
    {value: 'gold', label: 'gold'},
    {value: 'lime', label: 'lime'},
    {value: 'green', label: 'green'},
    {value: 'cyan', label: 'cyan'},
    {value: 'blue', label: 'blue'},
    {value: 'geekblue', label: 'geekblue'},
    {value: 'purple', label: 'purple'},
  ]

  const hendleCreateSearchTemplates = () => {
    const params = {
      search_template: {
        searchable_type: props.searchableType,
        search_params: props.searchParams,
        name: searchTemplate.name,
        color: searchTemplate.color,
      }
    }
    setLoading(true)
    setErrors({})
    Rest.post(`/api/v1/search_templates.json`, params).then(
      (response) => {
        toast.success('Шаблон поиска успешно создан');
        if (props.closeModal) {props.closeModal()}
      }).catch((e) => {
        setErrors(e.response.data.search_template.errors)
        console.log(e.response.data.search_template.errors)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item
        label='Название'
        help={errors?.name && errors?.name.join(", ")}
        validateStatus={errors?.name && "error"}
      >
        <Input onChange={(e)=>{setSearchTemplate({...searchTemplate, name: e.target.value})}}/>
      </Form.Item>
      <Form.Item
        label='Цвет тега'
        help={errors?.color && errors?.color.join(", ")}
        validateStatus={errors?.color && "error"}
      >
        <Select
          options={tag_colors}
          onChange={(value)=>{setSearchTemplate({...searchTemplate, color: value})}}
          value={searchTemplate.color}
          optionRender={(option) => (
            <Tag
              color={option.value}
            >
              {searchTemplate.name || <i>Название</i>}
            </Tag>
          )}
          labelRender={(option)=> (
            <Tag
              color={option.value}
            >
              {searchTemplate.name || <i>Название</i>}
            </Tag>
          )}
        />
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', margin: "0 auto" }}>
            <Button key="submit" type="primary" onClick={hendleCreateSearchTemplates}>
              Сохранить
            </Button>
          </div>
        </Form.Item>
    </Form>
  );
};

export default FormAdd;
