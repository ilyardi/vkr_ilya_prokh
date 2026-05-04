import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import Rest from 'tools/rest';
import { debounce, map as _map } from 'lodash';

const { Option } = Select;

const AvailableServiceCard = ({ serviceData, onSave }) => {
  const [service, setService] = useState(serviceData || {
    building_id: null,
    tar_id: null,
    tar_id_free: null,
    service_type: null,
    service_name: null,
  });
  const [errors, setErrors] = useState({});
  const [street_id, setStreetId] = useState(serviceData?.street_id);
  const [streets, setStreets] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(false);

  const serviceTypes = [
    { label: 'Умный домофон', value: 'teledom_ud' }
  ];

  useEffect(() => {
    loadStreets();
    loadTariffs();
    if (street_id) {
      loadBuildings(street_id)
    }
  },[])

  const handleSave = () => {
    setLoading(true);
    const payload = { available_service: service };
    const request = service?.id
      ? Rest.put(`/api/v1/available_services/${service.id}`, payload)
      : Rest.post('/api/v1/available_services', payload);

    request
      .then(() => {
        message.success(service?.id ? 'Услуга обновлена' : 'Услуга создана');
        onSave();
      })
      .catch(e => {
        setErrors(e.response.data.errors)
        message.error("Ошибка сохранения");
      })
      .finally(() => setLoading(false));
  };

  const loadStreets = () => {
    setLoading(true);
    Rest.get(`/api/v1/addresses.json`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setStreets(_map(suggestions, (s) => {
          return { label: s.value, value: s.id, key: s.id }
        }))
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false)
      });
  };

  const loadBuildings = (street_id) => {
    setLoading(true);
    Rest.get(`/api/v1/addresses/houses.json?street_id=${street_id}`)
      .then((response) => {
        const { data } = response;
        const { suggestions } = data;
        setBuildings(_map(suggestions, (s) => {
          return { label: s.value, value: s.id };
        }));
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadTariffs = () => {
    setLoading(true)
    Rest.get(`/api/v1/lb_tarifs.json`).then(
      (response) => {
        const { lb_tarifs } = response.data
        setTariffs(_map(lb_tarifs, (t) => {
          return { label: t.descr, value: t.tar_id }
        }))
      })
      .catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        setLoading(false)
      });
  };

  const handleStreetChange = (value) => {
    setService({
      ...service,
      building_id: null
    })
    setStreetId(value)
    loadBuildings(value)
  };

  const handleChangeSelector = (value, filter_name) => {
    setService({ ...service, [filter_name]: value });
    setErrors({ ...errors, [filter_name]: null});
  };

  const handleChangeServiceType = (_, option) => {
    setService({
      ...service,
      service_type: option.value,
      service_name: option.label,
    });
    setErrors({ ...errors, service_type: null });
  };

  return (
      <Form layout="vertical">
        <Form.Item label="Улица">
          <Select
            showSearch
            value={street_id}
            options={streets}
            onChange={handleStreetChange}
            placeholder="Выберите улицу"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item
          label="Дом"
          help={errors?.building_id && errors?.building_id.join(", ")}
          validateStatus={errors?.building_id && "error"}
        >
          <Select
            showSearch
            value={service?.building_id}
            disabled={!street_id}
            options={buildings}
            onChange={(value) => { handleChangeSelector(value, 'building_id') }}
            placeholder="Выберите дом"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item
          label="Основной тариф"
          help={errors?.tar_id && errors?.tar_id.join(", ")}
          validateStatus={errors?.tar_id && "error"}
        >
          <Select
            showSearch
            value={service.tar_id}
            onChange={(value) => { handleChangeSelector(value, 'tar_id') }}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={tariffs}
            placeholder="Выберите тариф"
          />
        </Form.Item>
        <Form.Item
          label="Льготный тариф"
          help={errors?.tar_id_free && errors?.tar_id_free.join(", ")}
          validateStatus={errors?.tar_id_free && "error"}
        >
          <Select
            showSearch
            value={service?.tar_id_free}
            onChange={(value) => { handleChangeSelector(value, 'tar_id_free') }}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={tariffs}
            placeholder={"Выберите льготный тариф"}
          />
        </Form.Item>
        <Form.Item
          label="Тип услуги"
          help={errors?.service_type && errors?.service_type.join(", ")}
          validateStatus={errors?.service_type && "error"}
        >
          <Select
            value={service.service_type}
            onChange={handleChangeServiceType}
            placeholder="Выберите тип"
            options={serviceTypes}
          />
        </Form.Item>
        <Form.Item label="Название услуги">
          <Input value={service.service_name} readOnly/>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </Form.Item>
      </Form>
  );
};

export default AvailableServiceCard;
