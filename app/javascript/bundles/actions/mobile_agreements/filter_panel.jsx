import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Checkbox, Button, NavBar, Picker, Space, Popup, List, SearchBar } from 'antd-mobile';
import { CloseCircleFill } from 'antd-mobile-icons';
import Rest from 'tools/rest';

// Обертка для простых полей без поиска
const SimplePicker = ({ value, onChange, options, placeholder }) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find(opt => opt.value === value);
  const displayValue = selected ? selected.label : null;

  const handleClear = (e) => {
    e.stopPropagation(); // Prevent picker from opening
    onChange?.(null);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setVisible(true)}>
        <span>
          {displayValue || <span style={{ color: '#ccc' }}>{placeholder}</span>}
        </span>
        {value && (
          <div onClick={handleClear} style={{ padding: '5px', lineHeight: 1 }}>
            <CloseCircleFill style={{ color: '#999', fontSize: '14px' }} />          </div>
        )}
      </div>
      <Picker
        columns={[options]}
        visible={visible}
        onClose={() => setVisible(false)}
        value={[value]}
        onConfirm={(v) => {
          onChange?.(v[0]);
        }}
      />
    </>
  );
};

// Новый компонент для полей с поиском
const SearchablePicker = ({ value, onChange, options, placeholder, disabled }) => {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState('');

    const filteredOptions = useMemo(
        () => options.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
        [options, query]
    );

    const selected = options.find(opt => opt.value === value);
    const displayValue = selected ? selected.label : null;

    const handleClear = (e) => {
        e.stopPropagation(); // Prevent picker from opening
        onChange?.(null);
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => !disabled && setVisible(true)}>
                <span>
                    {displayValue || <span style={{ color: disabled ? '#ddd' : '#ccc' }}>{placeholder}</span>}
                </span>
                {value && !disabled && (
                    <div onClick={handleClear} style={{ padding: '5px', lineHeight: 1 }}>
                  <CloseCircleFill style={{ color: '#999', fontSize: '14px' }} />
                    </div>
                )}
            </div>
            <Popup
                visible={visible}
                onMaskClick={() => setVisible(false)}
                position='right'
                bodyStyle={{ height: '100%', width: '100%' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <NavBar onBack={() => setVisible(false)}>{placeholder}</NavBar>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      <SearchBar placeholder="Поиск..." onChange={val => setQuery(val)} />
                    </div>
                    <div style={{ flex: 1, overflowY: 'scroll' }}>
                        <List>
                            {filteredOptions.map(item => (
                                <List.Item
                                    key={item.value}
                                    onClick={() => {
                                      onChange?.(item.value);
                                      setVisible(false);
                                    }}
                                >
                                  {item.label}
                                </List.Item>
                            ))}
                        </List>
                    </div>
                </div>
            </Popup>
        </>
    );
};


const FilterPanel = ({ visible, onClose, onApply, initialSearch }) => {
  const [form] = Form.useForm();
  const [streetOptions, setStreetOptions] = useState([]);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [flatOptions, setFlatOptions] = useState([]);
  const [tariffOptions, setTariffOptions] = useState([]);

  const streetId = Form.useWatch('street_id', form);
  const buildingId = Form.useWatch('building_id', form);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialSearch || {});
      if (streetOptions.length === 0) loadStreetOptions();
      if (tariffOptions.length === 0) loadTariffOptions();
      if (initialSearch?.street_id) loadBuildingOptions(initialSearch.street_id);
      if (initialSearch?.building_id) loadFlatOptions(initialSearch.building_id);
    }
  }, [visible, initialSearch]);

  useEffect(() => {
    if (streetId === undefined) return;
    form.setFieldsValue({ building_id: null, flat_id: null });
    setBuildingOptions([]);
    setFlatOptions([]);
    if (streetId) {
      loadBuildingOptions(streetId);
    }
  }, [streetId]);

  useEffect(() => {
    if (buildingId === undefined) return;
    form.setFieldsValue({ flat_id: null });
    setFlatOptions([]);
    if (buildingId) {
      loadFlatOptions(buildingId);
    }
  }, [buildingId]);

  const loadStreetOptions = () => Rest.get('/api/v1/addresses.json').then(res => setStreetOptions(res.data?.suggestions || []));
  const loadBuildingOptions = (streetId) => Rest.get(`/api/v1/addresses/houses.json?street_id=${streetId}`).then(res => setBuildingOptions(res.data?.suggestions || []));
  const loadFlatOptions = (buildingId) => Rest.get(`/api/v1/addresses/flats.json?building_id=${buildingId}`).then(res => setFlatOptions(res.data || []));
  const loadTariffOptions = () => Rest.get('/api/v1/lb_tarifs.json').then(res => setTariffOptions(res.data?.lb_tarifs || []));

  const handleApply = () => {
    const values = form.getFieldsValue();
    onApply(values);
    onClose();
  };

  const handleReset = () => {
    form.resetFields();
    onApply({});
    onClose();
  };

  const typeOptions = [
      { label: 'Юридическое лицо', value: 1 },
      { label: 'Физическое лицо', value: 2 },
  ];
  
  const lkStatusOptions = [
      { label: 'ПЛК', value: 'confirmed_lk' },
      { label: 'ЛК', value: 'unconfirmed_lk' },
      { label: 'Без ЛК', value: 'no_lk' },
  ];

  const billDeliveryOptions = [
      { label: 'Электронный+Бумажный', value: 'all' },
      { label: 'Электронный', value: 'email' },
      { label: 'Бумажный', value: 'receipt' },
  ];

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position='right'
      bodyStyle={{ height: "100%", width: '100%', background: '#f5f5f5' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <NavBar onBack={onClose}>Фильтры</NavBar>

        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          <Form form={form} layout="vertical">
            <Form.Item name="number" label="Номер договора"><Input clearable /></Form.Item>
            <Form.Item name="name" label="ФИО"><Input clearable /></Form.Item>
            <Form.Item name="phone" label="Телефон"><Input type="tel" clearable /></Form.Item>
            <Form.Item name="type" label="Тип договора">
              <SimplePicker options={typeOptions} placeholder="Выберите тип договора" />
            </Form.Item>
            <Form.Item name="street_id" label="Улица">
              <SearchablePicker options={streetOptions.map(s => ({ label: s.value, value: s.id }))} placeholder="Выберите улицу" />
            </Form.Item>
            <Form.Item name="building_id" label="Дом">
              <SearchablePicker disabled={!streetId} options={buildingOptions.map(b => ({ label: b.value, value: b.id }))} placeholder="Дом" />
            </Form.Item>
            <Form.Item name="flat_id" label="Квартира">
              <SearchablePicker disabled={!buildingId} options={flatOptions.map(f => ({ label: f.name, value: f.flat_id }))} placeholder="Квартира" />
            </Form.Item>
            <Form.Item label="Баланс">
              <Space>
                <Form.Item name="balanceFrom" noStyle><Input type="number" placeholder="от" /></Form.Item>
                <Form.Item name="balanceTo" noStyle><Input type="number" placeholder="до" /></Form.Item>
              </Space>
            </Form.Item>
            <Form.Item name="lkStatus" label="Статус ЛК">
              <SimplePicker options={lkStatusOptions} placeholder="Выберите статус ЛК" />
            </Form.Item>
            <Form.Item name="billDelivery" label="Способ счета">
              <SimplePicker options={billDeliveryOptions} placeholder="Способ счета" />
            </Form.Item>
            <Form.Item name="tar_id" label="Тариф">
              <SearchablePicker options={tariffOptions.map(t => ({ label: t.descr, value: t.tar_id }))} placeholder="Выберите тариф" />
            </Form.Item>
            <Form.Item name="unblocked" valuePropName="checked" layout='horizontal'>
              <Checkbox>Только активные</Checkbox>
            </Form.Item>
          </Form>
        </div>

        <div style={{
          background: 'white',
          borderTop: '1px solid #eee',
          padding: '16px',
        }}>
          <Button block shape="rounded" size="large" color="primary" onClick={handleApply}>Применить</Button>
        </div>
      </div>
    </Popup>
  );
};

export default FilterPanel;


