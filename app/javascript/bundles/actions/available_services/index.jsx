import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Popconfirm } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Rest from 'tools/rest';
import AvailableServiceCard from './components/availableServiceCard';

const AvailableServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, per: 20, total: 0 });

  const [isCardVisible, setIsCardVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    loadServices();
  }, [meta.page, meta.per]);

  const loadServices = () => {
    setLoading(true);
    Rest.get('/api/v1/available_services', { params: { page: meta.page, per: meta.per } })
      .then((response) => {
        const data = response.data.available_services || response.data;
        setServices(data);
        if (response.data.meta) {
          setMeta(response.data.meta);
        }
      })
      .catch(() => { message.error('Ошибка загрузки списка услуг')})
      .finally(() => setLoading(false));
  };

  const handleDelete = (service_id) => {
    Rest.delete(`/api/v1/available_services/${service_id}`)
    .then(() => {
      loadServices()
      message.success('Сервис отключен');
    })
    .catch(e => {
      message.error("Ошибка при отключении сервиса");
    });
  };

  const handleTableChange = (pagination) => {
    setMeta({
      ...meta,
      page: pagination.current,
      per: pagination.pageSize,
    });
  };

  const showCard = (service = null) => {
    setEditingService(service);
    setIsCardVisible(true);
  };

  const hideCard = () => {
    setIsCardVisible(false);
    setEditingService(null);
  };

  const handleSaveSuccess = () => {
    hideCard();
    loadServices();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Адрес', dataIndex: 'address', key: 'address' },
    { title: 'Тариф', dataIndex: 'tarif', key: 'tarif' },
    { title: 'Льгот. тариф', dataIndex: 'tarif_free', key: 'tarif_free' },
    { title: 'Тип услуги', dataIndex: 'service_type', key: 'service_type' },
    { title: 'Название услуги', dataIndex: 'service_name', key: 'service_name' },
    {
      title: '',
      key: 'actions',
      render: (_, record)=>(
        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
          <Popconfirm
            placement="left"
            title="Вы уверены, что хотите отключить Сервис?"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
            onCancel={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            okText="Да"
            cancelText="Нет"
          >
            <Button title="Отключить сервис" icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )
    },
  ];
  return (
    <React.Fragment>
      <PageHeader
        title="Реестр доступных услуг"
        extra={[
          <Button key="1" type="primary" icon={<PlusOutlined />} onClick={() => showCard()}>
            Создать
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={services}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: meta.page,
          pageSize: meta.per,
          total: meta.total,
          showSizeChanger: true,
        }}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => { showCard(record) }, // click row
          };
        }}
      />
      <Modal
        title={editingService ? `Редактировать услугу № ${editingService.id}` : 'Создать новую услугу'}
        open={isCardVisible}
        onCancel={hideCard}
        footer={null}
        width="60%"
        destroyOnHidden
      >
        <AvailableServiceCard
          serviceData={editingService}
          onSave={handleSaveSuccess}
        />
      </Modal>
    </React.Fragment>
  );
};

export default AvailableServices;
