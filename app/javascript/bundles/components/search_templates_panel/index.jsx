import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  Button,
  Modal,
  Typography,
  Popconfirm,
  Tag,
} from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  remove as _remove,
  isEqual as _isEqual,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';

import FormAdd from './components/form_add'

const { Text } = Typography;

const SearchTemplatesPanel = (props) => {

  const [searchTemplates, setSearchTemplates] = useState([]);
  const [visibleAddForm, setVisibleAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSearchTemplates = () => {
    const params = {
      search: {
        searchable_type: props.searchableType
      }
    }
    setLoading(true)
    Rest.get(`/api/v1/search_templates.json`, { params: params }).then(
      (response) => {
        const { search_templates } = response.data;
        setSearchTemplates(search_templates);
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteSearchTemplate = (template) => {
    setLoading(true);
    Rest.delete(`/api/v1/search_templates/${template.id}`)
      .then((response) => {
        const {search_template} = response.data
        let newSearchTemplates = searchTemplates
        _remove(newSearchTemplates, (template) => {
              return template.id == search_template.id
            });
        setSearchTemplates(newSearchTemplates);
        toast.success('Поисковый шаблон успешно удален');
      })
      .catch((e) => {
        toast.error("Ошибка удаление шаблона поиска")
        console.log(e.response.data.search_template.errors)
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseAddForm = () => {
    setVisibleAddForm(false);
    getSearchTemplates();
  };

  useEffect(() => {
    getSearchTemplates();
  }, []);

  return (
    <>
      {visibleAddForm &&
        <Modal
          title={"Форма сохранения поискового запроса"}
          open={visibleAddForm}
          onCancel={handleCloseAddForm}
          onOk={handleCloseAddForm}
          footer={false}
          width={'30%'}
        >
          <FormAdd
            closeModal={handleCloseAddForm}
            searchParams={props.searchParams}
            searchableType={props.searchableType}
          />
        </Modal>
      }
      <div style={{margin: '10px 0', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
        <div>
          <Text style={{marginRight: '10px'}}>Избранное:</Text>
          {_map(searchTemplates, (template)=>(
            <Tag
              color={template.color}
              style={{
                padding: '0 2px 0 5px'
              }}
              onClose={(e)=>{
                e.preventDefault()
              }}
              onClick={(e)=>{
                props.setSearchParams(template.search_params)
              }}
              closeIcon={
                <Popconfirm
                  description="Вы уверены что хотите удалить избранный поиск?"
                  onConfirm={(e) => {
                    e.stopPropagation()
                    deleteSearchTemplate(template)
                  }}
                  onCancel={(e) => {
                    e.stopPropagation()
                  }}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button
                    style={{
                      backgroundColor: 'inherit',
                      border: 'none',
                      width: '14px',
                      marginLeft: '10px',
                      height: 'inherit',
                      padding: '0',
                    }}
                    icon={<CloseOutlined style={{fontSize: '10px'}} />}
                  />
                </Popconfirm>
              }
            >
              {template.name}
            </Tag>
          ))}
        </div>
        <div>
          <Button
            icon={<PlusOutlined />}
            onClick={(e)=>{setVisibleAddForm(true)}}
          >
            Сохранить фильтр
          </Button>
        </div>
      </div>
    </>
  );
};

export default SearchTemplatesPanel;
