import React, { Component } from 'react';
import Rest from 'tools/rest';
import { withStyles } from '@material-ui/core/styles';
import { Table, Button, Typography } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { red, volcano, green, yellow } from '@ant-design/colors';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  isEqual as _isEqual,
  last as _last,
  includes as _includes,
  round as _round,
} from 'lodash';
import dayjs from 'dayjs';

import Preloader from 'components/preloader';
// import './index.css'

const { Text } = Typography

class ConversionTimeSlots extends Component {
  state = {
    working_time_by_connect_engineers: [],
    working_time_by_service_engineers: [],
    working_time_by_technical_engineers: [],
    data_relevance: false,
    date: new Date(),
    loading: false,
  };

  componentDidMount() {
    this.loadData();
  };

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.data_relevance) {
      this.loadData();
    }
  };

  loadData = () => {
    const params = {
      date: this.state.date,
    };
    this.setState({ loading: true, data_relevance: true });
    Rest.get('/api/v1/reports/conversion_time_slots', { params: params }).then((response) => {
      const {
        working_time_by_connect_engineers,
        working_time_by_service_engineers,
        working_time_by_technical_engineers
      } = response.data;

      this.setState({
        working_time_by_connect_engineers,
        working_time_by_service_engineers,
        working_time_by_technical_engineers
      });
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });
  };

  render() {
    const {
      date,
      working_time_by_connect_engineers,
      working_time_by_service_engineers,
      working_time_by_technical_engineers,
    } = this.state;

    const { classes } = this.props;

    const buildTableDataWithGross = (records = []) => {
      const grossRecord = _find(records, { gross: true });
      const regularRecords = records.filter((record) => !record.gross);

      return grossRecord ? [...regularRecords, grossRecord] : regularRecords;
    };

    const serviceEngineersData = buildTableDataWithGross(working_time_by_service_engineers);
    const connectEngineersData = buildTableDataWithGross(working_time_by_connect_engineers);
    const technicalEngineersData = buildTableDataWithGross(working_time_by_technical_engineers);

    const components = {
      header: {
        cell: ({ style, ...restProps }) => {
          return (
            <th
              style={{
                borderColor: 'black',
                borderTop: '1px solid',
                textAlign: 'left',
                ...style
              }}
              {...restProps}
            />
          )
        }
      },
      body: {
        cell: ({ style, ...restProps }) => {
          return (
            <td
              style={{
                ...style,
                borderColor: 'black',
                // textAlign: 'right',
                fontWeight: 'bold',
                padding: '2px',
              }}
              {...restProps}
            />
          );
        },
      },
    };

    const columns = [
      {
        title: 'ФИО',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        align: 'left'
      },
      {
        title: 'Смен',
        dataIndex: 'shift',
        key: 'shift',
        align: 'right'
      },
      {
        title: 'План слотов',
        dataIndex: 'plan_slots',
        key: 'plan_slots',
        align: 'right'
      },
      {
        title: 'Факт слотов',
        dataIndex: 'fact_slots',
        key: 'fact_slots',
        align: 'right'
      },
      {
        title: 'Конверсия',
        dataIndex: 'conversion',
        key: 'conversion',
        align: 'right'
      },
      {
        title: 'KPI',
        dataIndex: 'kpi',
        key: 'kpi',
        align: 'right'
      },
    ];



    return (
      <React.Fragment>
        <Preloader loading={this.state.loading}>
          <PageHeader title="Конверсия тайм-слотов" />
          <Table
            title={() => {
              return (
                <React.Fragment>
                  <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Button
                      onClick={(event) => {
                        this.setState((prevStat) => {
                          prevStat.date.setMonth(prevStat.date.getMonth() - 1)
                          prevStat.data_relevance = false
                          return prevStat
                        })
                      }}
                      icon={<CaretLeftOutlined />}
                    />
                    <Text style={{ fontSize: '16pt', verticalAlign: 'middle' }}>
                      {date.toLocaleDateString('ru', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </Text>
                    <Button
                      onClick={(event) => {
                        this.setState((prevStat) => {
                          prevStat.date.setMonth(prevStat.date.getMonth() + 1)
                          prevStat.data_relevance = false
                          return prevStat
                        })
                      }}
                      icon={<CaretRightOutlined />}
                    />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <Text style={{ fontSize: '16pt', verticalAlign: 'middle' }}>Сервисная служба</Text>
                  </div>
                </React.Fragment>
              )
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={serviceEngineersData}
            columns={columns}
            rowKey={(record) => record.id}
            rowClassName={(record) => (record.gross ? classes.warning : '')}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => (
              <div style={{ textAlign: 'left' }}>
                <Text style={{ fontSize: '16pt', verticalAlign: 'middle' }}>Монтажники сетей связи</Text>
              </div>
            )}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={connectEngineersData}
            columns={columns}
            rowKey={(record) => record.id}
            rowClassName={(record) => (record.gross ? classes.warning : '')}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => (
              <div style={{ textAlign: 'left' }}>
                <Text style={{ fontSize: '16pt', verticalAlign: 'middle' }}>Эксплуатация сети</Text>
              </div>
            )}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={technicalEngineersData}
            columns={columns}
            rowKey={(record) => record.id}
            rowClassName={(record) => (record.gross ? classes.warning : '')}
            pagination={false}
            size="small"
            bordered
          />
        </Preloader>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  danger: {
    backgroundColor: red[1],
  },
  warning: {
    backgroundColor: yellow[1],
  },
  success: {
    backgroundColor: green[1],
  },
  error: {
    backgroundColor: volcano[1],
  },
});

export default withStyles(styles)(ConversionTimeSlots);
