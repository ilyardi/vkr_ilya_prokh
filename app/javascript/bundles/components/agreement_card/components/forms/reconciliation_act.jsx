import React, { useState, useEffect, useContext } from 'react';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  Button,
  message,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  InputNumber,
  Steps,
  Checkbox,
  Divider,
  Collapse,
  ConfigProvider,
  FloatButton,
  Radio,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
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
import qs from 'qs';

const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ReconciliationAct = (props) => {
  const { match, classes, agrm_id } = props;

  // const [messageApi, contextHolder] = message.useMessage();

  // const toastify = (type, content) => {
  //   messageApi.open({
  //     type: type,
  //     content: content,
  //   });
  // };

  const [period, setPeriod] = useState([]);
  const [reportType, setReportType] = useState('csv');


  const handleCreateReport = ()=> {
    const params = qs.stringify(
      { period: period },
      {
        arrayFormat: 'brackets',
      },
    );
    window.open(`/api/v1/lb_agreements/${agrm_id}/reconciliation_act.${reportType}?${params}`);
  };

  const save_and_close = (handleSaveExp) => {
    handleSaveExp('close');
  };

  const size = 'large'

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: '#8f00ff82',
            itemSelectedColor: '#FFFFFF',
            itemColor: '#FFFFFF',
          },
          Form: {
            labelHeight: '18px',
            lineHeight: '18px',
            labelFontSize: '12px',
            verticalLabelPadding: '0'
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
          Collapse: {
            borderRadiusLG: '25px',
          },
          DatePicker: {
            borderRadiusLG: '25px',
          },
          Table: {
            cellPaddingBlock: '3px',
          },
        },
      }}
    >
      {/* {contextHolder} */}
      {/* <div className={classes.main}>

      </div> */}
      <Form
        // labelCol={{ span: 8 }}
        wrapperCol={{ span: 24 }}
        layout="vertical"
      >
        <Form.Item
          label={<Text className={classes.menuItemLabel}>Период</Text>}
        // help={errors?.plan_date_payment && errors?.plan_date_payment.join(", ")}
        // validateStatus={errors?.plan_date_payment && "error"}
        >
          <RangePicker
            picker="month"
            style={{width: '100%'}}
            // value={period}
            onChange={(dates, dateStrings)=>{
              if (dates) {
                setPeriod([dates[0].format("YYYY-MM-DD"),dates[1].format("YYYY-MM-DD")])
              } else {
                setPeriod([null, null])
              }
            }}
          />
        </Form.Item>
        <Form.Item
          label={<Text className={classes.menuItemLabel}>Тип отчета</Text>}
        // help={errors?.plan_date_payment && errors?.plan_date_payment.join(", ")}
        // validateStatus={errors?.plan_date_payment && "error"}
        >
          <Row gutter={20} justify='space-between'>
            <Col>
              <Radio.Group
                value={reportType}
                onChange={(e) => { setReportType(e.target.value) }}
              >
                <Radio.Button value="csv">CSV</Radio.Button>
                <Radio.Button value="html">Web</Radio.Button>
              </Radio.Group>
            </Col>
            <Col>
              <Button onClick={handleCreateReport}>Сформировать</Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  main: {
    // height: '74vh',
    height: '100%',
    width: '90%',
    margin: '20px auto',
    overflowY: 'scroll',
    overflowX: 'hidden'
  },
  menuItemLabel: {
    marginLeft: '15px',
    fontStyle: 'italic'
  },
});

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(ReconciliationAct));
