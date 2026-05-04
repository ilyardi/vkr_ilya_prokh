import React, { useState } from 'react';
import { Form, Button, DatePicker, Radio, Space } from 'antd-mobile';
import qs from 'qs';

const { RangePicker } = DatePicker;

const ReconciliationAct = ({ agrm_id }) => {
  const [period, setPeriod] = useState([]);
  const [reportType, setReportType] = useState('csv');

  const handleCreateReport = () => {
    const params = qs.stringify({ period }, { arrayFormat: 'brackets' });
    window.open(`/api/v1/lb_agreements/${agrm_id}/reconciliation_act.${reportType}?${params}`);
  };

  return (
    <Form layout="vertical" style={{ padding: 10 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Период</div>
      <RangePicker
        picker="month"
        style={{ width: '100%' }}
        onChange={(dates) => {
          if (dates) {
            setPeriod([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
          } else {
            setPeriod([null, null]);
          }
        }}
      />

      <div style={{ fontWeight: 'bold', margin: '15px 0 6px' }}>Тип отчета</div>
      <Space direction="vertical" block>
        <Radio.Group
          value={reportType}
          onChange={(e) => setReportType(e)}
        >
          <Radio value="csv">CSV</Radio>
          <Radio value="html">Web</Radio>
        </Radio.Group>

        <Button block color="primary" onClick={handleCreateReport}>
          Сформировать
        </Button>
      </Space>
    </Form>
  );
};

export default ReconciliationAct;
