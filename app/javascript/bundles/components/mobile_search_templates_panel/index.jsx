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
import {
  CapsuleTabs,
  Dialog,
  Modal as MModal
} from 'antd-mobile'
import { PlusOutlined, CloseOutlined, StarOutlined } from '@ant-design/icons';
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

const MobileSearchTemplatesPanel = (props) => {

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
        <MModal
          style={{ width: '100%' }}
          title={"Сохранить шаблон"}
          content={
            <FormAdd
              closeModal={handleCloseAddForm}
              searchParams={props.searchParams}
              searchableType={props.searchableType}
            />
          }
          visible={visibleAddForm}
          closeOnMaskClick={true}
          onClose={handleCloseAddForm}
        />
      }
      <div
        style={{
          width: '80px',
          height: '8vh',
          display: 'flex',
          justifyContent: 'space-evenly',
          position: 'absolute',
          top: '0px',
          left: '160px',
          fontSize: '30px',
          color: '#59059B',
          zIndex: '2',
        }}
      >
        <StarOutlined onClick={(e) => { setVisibleAddForm(true) }} />
      </div>
      <div style={{margin: '10px 0', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
        <div style={{ display: 'flex', overflowX: 'scroll', scrollbarWidth: 'none', }}>
          {_map(searchTemplates, (template)=>(
            <Tag
              color={template.color}
              style={{
                padding: '0px 0px 0px 10px',
                margin: '0 5px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '20px',
                fontSize: '18px',
                lineHeight: '30px',
                borderRadius: '20px'
              }}
              onClose={(e) => {
                e.preventDefault()
              }}
              onClick={(e) => {
                props.setSearchParams(template.search_params)
              }}
              closeIcon={
                <CloseOutlined
                  style={{ fontSize: '18px', display: 'flex', margin: '0px 10px'}}
                  onClick={()=> {
                    Dialog.confirm({
                      title: 'Вы уверены что хотите удалить избранный поиск?',
                      closeOnMaskClick: true,
                      cancelText: 'Нет',
                      confirmText: 'Да',
                      onConfirm: () => {
                        deleteSearchTemplate(template)
                      },
                    })
                  }}
                />
              }
            >
              {template.name}
            </Tag>
          ))}
          {/* <Tag
            style={{
              padding: '0 15px',
              margin: '0 10px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '20px',
              fontSize: '18px',
              lineHeight: '30px',
              borderRadius: '20px'
            }}
          >
            <PlusOutlined onClick={(e) => { setVisibleAddForm(true) }} />
          </Tag> */}
        </div>
      </div>
    </>
  );
};

export default MobileSearchTemplatesPanel;
