import React, { useState, useEffect } from 'react';
import { Table, Card, Statistic, Row, Col, Spin, DatePicker, message, AutoComplete } from 'antd';
import Rest from 'tools/rest';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const TeledomReports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState([dayjs().startOf('day'), dayjs().endOf('day')]);
  const [addresses, setAddresses] = useState([]);
  const [allAddresses, setAllAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [billingStats, setBillingStats] = useState({
    ud_contracts: 0,
    ad_contracts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [externalStats, setExternalStats] = useState({
    faces: 0,
    keys: 0,
    domophones: 0
  });

  const fetchBillingStats = () => {
    setStatsLoading(true);
    Rest.get('/api/teledom/agreements/billing_stats')
    .then(response => {
      setBillingStats(response.data);
    })
    .catch(error => {
      console.error("Ошибка загрузки статистики биллинга:", error);
      message.error("Не удалось загрузить статистику 'В работе'");
    })
    .finally(() => {
      setStatsLoading(false);
    });
  };

  const fetchExternalStats = () => {
    Rest.get('/api/teledom/agreements/report_total')
    .then(response => {
      setExternalStats(response.data);
    })
    .catch(error => {
      console.error("Ошибка загрузки внешних данных:", error);
      message.error("Не удалось загрузить данные с сервиса отчётов");
    });
  };

  const fetchAllAddresses = () => {
    Rest.get('/api/teledom/agreements/all_rbt_addresses')
    .then(response => {
      const processAddressData = (data) => {
        const flatList = [];
        if (!data || !data.streets) return flatList;
        for (const streetId in data.streets) {
          const street = data.streets[streetId];
          for (const buildingId in street.buildings) {
            const building = street.buildings[buildingId];
            flatList.push({
              label: `${street.name}, д. ${building.name}`,
              value: `${street.name}, д. ${building.name}`,
              id: { 
                street_id: street.street_id, 
                house_id: building.building_id, 
                entrance_id: null 
              }
            });
            
            if (Object.keys(building.entrances).length > 0) {
              for (const entranceId in building.entrances) {
                const entrance = building.entrances[entranceId];
                flatList.push({
                  label: `${street.name}, д. ${building.name}, ${entrance.name}`,
                  value: `${street.name}, д. ${building.name}, ${entrance.name}`,
                  id: { 
                    street_id: street.street_id, 
                    house_id: building.building_id, 
                    entrance_id: entrance.entrance_id 
                  }
                });
              }
            }
          }
        }
        return flatList;
      };
      const processedAddresses = processAddressData(response.data);
      setAllAddresses(processedAddresses);
    })
    .catch(error => {
      console.error("Ошибка загрузки списка адресов:", error);
      message.error("Не удалось загрузить список адресов");
    });
  };

  useEffect(() => {
    fetchBillingStats();
    fetchAllAddresses();
    fetchExternalStats();
  }, []);

  const handleAddressSearch = (searchText) => {
    if (!searchText) {
      setAddresses([]);
      return;
    }

    const filtered = allAddresses.filter(addr =>
      addr.label.toLowerCase().includes(searchText.toLowerCase())
    );
    setAddresses(filtered);
  };

  const handleAddressSelect = (value, option) => {
    setSelectedAddressId(option.id);
  };

  const fetchReportData = () => {
    const fromDate = dateRange?.[0] || dayjs().startOf('day');
    const toDate = dateRange?.[1] || dayjs().endOf('day');
    
    setLoading(true);
    
    const params = {
      from: fromDate.format('YYYY-MM-DD'),
      to: toDate.format('YYYY-MM-DD'),
    };
    
    // Если адрес выбран, добавляем его параметры
    if (selectedAddressId) {
      params.street_id = selectedAddressId.street_id;
      params.house_id = selectedAddressId.house_id;
      params.entrance_id = selectedAddressId.entrance_id;
    }
    // Если адрес не выбран - отправляем без параметров адреса (грузятся все адреса)

    Rest.get('/api/teledom/agreements/reports', { params })
      .then((response) => {
        setReportData(response.data);
      })
      .catch((e) => {
        console.error('error', e);
        message.error('Ошибка загрузки отчета');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedAddressId]);

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'day',
      key: 'day',
      render: date => new Date(date).toLocaleDateString(),
      width: 120
    },
    {
      title: 'Ключом',
      dataIndex: 'open_by_key',
      key: 'open_by_key',
      align: 'right',
      sorter: (a, b) => a.open_by_key - b.open_by_key
    },
    {
      title: 'Приложением',
      dataIndex: 'open_by_app',
      key: 'open_by_app',
      align: 'right',
      sorter: (a, b) => a.open_by_app - b.open_by_app
    },
    {
      title: 'Кодом',
      dataIndex: 'open_by_code',
      key: 'open_by_code',
      align: 'right',
      sorter: (a, b) => a.open_by_code - b.open_by_code
    },
    {
      title: 'Лицом',
      dataIndex: 'open_by_face',
      key: 'open_by_face',
      align: 'right',
      sorter: (a, b) => a.open_by_face - b.open_by_face
    },
    {
      title: 'Вызовом',
      dataIndex: 'open_by_call',
      key: 'open_by_call',
      align: 'right',
      sorter: (a, b) => a.open_by_call - b.open_by_call
    },
  ];

  const totals = reportData.reduce((acc, item) => {
    return {
      keys: acc.keys + parseInt(item.open_by_key || 0),
      app: acc.app + parseInt(item.open_by_app || 0),
      code: acc.code + parseInt(item.open_by_code || 0),
      face: acc.face + parseInt(item.open_by_face || 0),
      call: acc.call + parseInt(item.open_by_call || 0)
    };
  }, { keys: 0, app: 0, code: 0, face: 0, call: 0 });

  const grandTotal = totals.keys + totals.app + totals.code + totals.face + totals.call;

  const tableLocale = {
    emptyText: (
      !dateRange 
      ? 'Пожалуйста, выберите дату для отображения отчета.'
      : 'Нет данных за выбранный период.'
    )
  };

  return (
    <div style={{marginBottom: 24 }}>
      <h1>Отчет по системе "Умный домофон"</h1>

      <div style={{ marginBottom: 24 }}>
        <h2>В работе</h2>
        <Spin spinning={statsLoading}>
          <Row gutter={16}>
            <Col span={4}>
              <Card><Statistic title="Домофоны" value={externalStats.domophones} /></Card>
            </Col>
            <Col span={4}>
              <Card><Statistic title="Лица" value={externalStats.faces} /></Card>
            </Col>
            <Col span={4}>
              <Card><Statistic title="Ключи" value={externalStats.keys} /></Card>
            </Col>
            <Col span={4}>
              <Card><Statistic title="Договоров УД" value={billingStats.ud_contracts} /></Card>
            </Col>
            <Col span={4}>
              <Card><Statistic title="Договоров АД" value={billingStats.ad_contracts} /></Card>
            </Col>
          </Row>
        </Spin>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2>
          События
        </h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: 'Ключом', value: totals.keys, field: 'open_by_key' },
          { title: 'Приложением', value: totals.app, field: 'open_by_app' },
          { title: 'Кодом', value: totals.code, field: 'open_by_code' },
          { title: 'Лицом', value: totals.face, field: 'open_by_face' },
          { title: 'Вызовом', value: totals.call, field: 'open_by_call' }
        ].map(item => {
          const percent = grandTotal > 0
          ? ((item.value / grandTotal) * 100).toFixed(1)
          : 0;

          return (
            <Col span={4} key={item.field}>
              <Card>
                <Statistic
                  title={`Открыто ${item.title.toLowerCase()}`}
                  value={item.value}
                  suffix={` (${percent}%)`}
                />
              </Card>
            </Col>
          );
        })}

        <Col span={4} key="total">
          <Card>
            <Statistic
              title="Всего открыто"
              value={grandTotal}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <AutoComplete
          style={{ width: 300, marginRight: 8 }}
          options={addresses}
          onSelect={handleAddressSelect}
          onSearch={handleAddressSearch}
          placeholder={allAddresses.length > 0 ? "Введите адрес для поиска" : "Загрузка адресов..."}
          disabled={allAddresses.length === 0}
          allowClear
          onClear={() => setSelectedAddressId(null)}
        />
        <RangePicker
          style={{ marginRight: 8 }}
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={reportData}
        rowKey="day"
        loading={loading}
        pagination={false}
        bordered
        scroll={{ x: true }}
        locale={tableLocale}
      />
    </div>
  );
};

export default TeledomReports;