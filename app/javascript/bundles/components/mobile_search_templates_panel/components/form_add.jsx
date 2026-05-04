import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { AbilityContext, Can } from 'tools/ability';
import { withStyles } from '@material-ui/core/styles';
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
  ConfigProvider,
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

  const { classes, match } = props;

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

  const size = 'large'

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelHeight: '18px',
            lineHeight: '18px',
            labelFontSize: '12px',
            verticalLabelPadding: '0',
          },
          Input: {
            borderRadiusLG: '25px',
            paddingLG: '40px',
          },
          InputNumber: {
            borderRadiusLG: '25px',
            paddingLG: '40px',
          },
          Select: {
            borderRadiusLG: '25px',
            paddingLeft: '20px',
          },
        },
      }}
    >
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label={<Text className={classes.menuItemLabel}>Название</Text>}
          help={errors?.name && errors?.name.join(", ")}
          validateStatus={errors?.name && "error"}
          style={{ marginBottom: '10px' }}
        >
          <Input
            size={size}
            onChange={(e)=>{setSearchTemplate({...searchTemplate, name: e.target.value})}}
          />
        </Form.Item>
        <Form.Item
          label={<Text className={classes.menuItemLabel}>Цвет тега</Text>}
          help={errors?.color && errors?.color.join(", ")}
          validateStatus={errors?.color && "error"}
          style={{ marginBottom: '10px' }}
        >
          <Select
            size={size}
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
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  filterBack: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #CDA5E6 100%)",
  },
  menuItemLabel: {
    marginLeft: '15px',
    fontStyle: 'italic'
  },
});

export default (withStyles(styles)(FormAdd));
