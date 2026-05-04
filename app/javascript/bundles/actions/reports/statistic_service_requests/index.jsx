import React, { Component } from 'react';
import Rest from 'tools/rest';
import { withStyles } from '@material-ui/core/styles';
import { Table, Button, Typography } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { CheckOutlined, CaretLeftOutlined, CaretRightOutlined, BarChartOutlined } from '@ant-design/icons';
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
import { BorderTop } from '@material-ui/icons';
import './index.css'

const { Text } = Typography

class StatisticServiceRequests extends Component {
  state = {
    records_internet: [],
    records_int_tv: [],
    records_tv: [],
    records_other: [],
    summary_solved_remotely_requests_by_group: [],
    summary_requests_by_group: [],
    summary_data: [],
    summary_data_by_time: [],
    year: new Date().getFullYear(),
    loading: false,
  };

  componentDidMount() {
    this.loadData();
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.year !== this.state.year) {
      this.loadData();
    }
  };

  loadData = () => {
    const params = {
      year: this.state.year,
    };
    this.setState({ loading: true });
    Rest.get('/api/v1/reports/statistic_service_requests', { params: params }).then((response) => {
      const { records_internet,
        records_int_tv,
        records_tv,
        records_other,
        summary_solved_remotely_requests_by_group,
        summary_requests_by_group,
        summary_data,
        summary_service_requests,
        summary_solved_remotely_requests,
        summary_data_by_time,
      } = response.data;
      this.setState({
        records_internet,
        records_int_tv,
        records_tv,
        records_other,
        summary_solved_remotely_requests_by_group,
        summary_requests_by_group,
        summary_data,
        summary_service_requests,
        summary_solved_remotely_requests,
        summary_data_by_time,
      });
    }).catch((e) => {
      console.error('error', e);
    }).finally(() => {
      this.setState({ loading: false });
    });
  };

  render() {
    const {
      records_internet,
      records_int_tv,
      records_tv,
      records_other,
      summary_solved_remotely_requests_by_group,
      summary_requests_by_group,
      summary_data,
      summary_data_by_time,
      year
    } = this.state;

    const { classes } = this.props;

    const components = {
      header: {
        cell: ({ style, ...restProps }) => {
          return (
            <th
              style={{
                borderColor: 'black',
                borderTop: '1px solid',
                textAlign: 'center',
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
                // textAlign: 'center',
                fontWeight: 'bold',
                padding: '2px',
              }}
              {...restProps}
            />
          );
        },
      },
    };

    const columns_for_months = [
      {
        align: 'center',
        title: 'Янв',
        dataIndex: '1',
        key: 1,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Фев',
        dataIndex: '2',
        key: 2,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Мар',
        dataIndex: '3',
        key: 3,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Апр',
        dataIndex: '4',
        key: 4,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Май',
        dataIndex: '5',
        key: 5,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Июн',
        dataIndex: '6',
        key: 6,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Июл',
        dataIndex: '7',
        key: 7,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Авг',
        dataIndex: '8',
        key: 8,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Сен',
        dataIndex: '9',
        key: 9,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Окт',
        dataIndex: '10',
        key: 10,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Ноя',
        dataIndex: '11',
        key: 11,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Дек',
        dataIndex: '12',
        key: 12,
        render: (value) => {
          return value ? value : null
        },
      },
      {
        align: 'center',
        title: 'Итого',
        dataIndex: 'total_count',
        key: 'total_count',
        width: '100px',
        render: (value) => (value ? _round(value, 2) : 0)
      },
    ]

    const columns = [
      {
        align: 'center',
        title: 'Причина',
        dataIndex: 'reason',
        key: 0,
        render: (value) => {
          return (value.description)
        },
        onCell: (record, index) => {
          if (!record.reason.description.indexOf('Форс-мажор')) {
            return { style: { backgroundColor: 'orange' } }
          }
          if (!record.reason.description.indexOf('ППР')) {
            return { style: { backgroundColor: 'yellow' } }
          }
        },
        width: '30%'
      },
      ...columns_for_months
    ];

    const columns_for_tv_int = [
      {
        align: 'center',
        title: '',
        dataIndex: 'reason',
        key: 'service_location',
        render: (value, record) => {
          return (value.service_location == 'operator' ? 'Оператор' : 'Абонент')
        },
        onCell: (record, index) => {
          if (index === 0) {
            return {
              rowSpan: 4
            }
          }
          if (index > 0 && index < 4) {
            return {
              rowSpan: 0
            }
          }
          if (index === 4) {
            return {
              rowSpan: 6
            }
          }
          if (index > 4) {
            return {
              rowSpan: 0
            }
          }
        },
        width: '100px',
      },
      ...columns,
    ];

    const columns_for_summary = [
      {
        align: 'right',
        dataIndex: 'record_name',
        key: 0,
        width: '30%',
        render: (value) => (value + " :")
      },
      ...columns_for_months
    ];

    return (
      <React.Fragment>
        <PageHeader title="Годовая статистика задач" />
        <Preloader loading={this.state.loading}>
          <Table
            title={() => {
              return (
                <React.Fragment>
                  <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                    <Button
                      onClick={(event) => {
                        this.setState({ year: this.state.year - 1 })
                      }}
                      icon={<CaretLeftOutlined />}
                    />
                    <Text style={{ fontSize: '16pt', verticalAlign: 'middle' }}>
                      {year}
                    </Text>
                    <Button
                      onClick={(event) => {
                        this.setState({ year: this.state.year + 1 })
                      }}
                      icon={<CaretRightOutlined />}
                    />
                  </div>
                  <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Интернет</Text>
                </React.Fragment>
              )
            }}
            summary={(currentData) => {
              const total_count_by_month = _find(summary_requests_by_group, { group: 'internet' })
              const solved_remotely_by_month = _find(summary_solved_remotely_requests_by_group, { group: 'internet' })
              let force_majeure_by_month = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              let operators_requests = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              _forEach(currentData, (value) => {
                if (_includes(value.reason.description, 'Форс-мажор') || _includes(value.reason.description, 'ППР')) {
                  for (let i = 1; i <= 12; i++) {
                    force_majeure_by_month[i] += value[i]
                  }
                }
              })

              _forEach(currentData, (value) => {
                if (value.reason.service_location == 'operator') {
                  for (let i = 1; i <= 12; i++) {
                    operators_requests[i] += value[i]
                  }
                }
              })

              if (!total_count_by_month) { return }

              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Решено удаленно ИНТ {year}:
                    </Table.Summary.Cell>
                    {_map(solved_remotely_by_month, (value, key) => {
                      if (key == 'group') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value ? value : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Решено удаленно ИНТ в % соотношении {year}:
                    </Table.Summary.Cell>
                    {_map(solved_remotely_by_month, (value, key) => {
                      if (key == 'group' || !total_count_by_month) return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      ИТОГО ЗАДАЧ ПО ИНТ {year}:
                    </Table.Summary.Cell>
                    {_map(total_count_by_month, (value, key) => {
                      if (key == 'group') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value ? value : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Обстоятельства непреодолимой силы:
                    </Table.Summary.Cell>
                    {_map(force_majeure_by_month, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      НА СТОРОНЕ ОПЕРАТОРА:
                    </Table.Summary.Cell>
                    {_map(operators_requests, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                </>
              )
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={records_internet}
            columns={columns_for_tv_int}
            rowKey={(record) => record.reason.id}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => {
              return <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Телевидение</Text>
            }}
            summary={(currentData) => {
              const total_count_by_month = _find(summary_requests_by_group, { group: 'tv' })
              const solved_remotely_by_month = _find(summary_solved_remotely_requests_by_group, { group: 'tv' })
              let force_majeure_by_month = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              let operators_requests = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              _forEach(currentData, (value) => {
                if (_includes(value.reason.description, 'Форс-мажор') || _includes(value.reason.description, 'ППР')) {
                  for (let i = 1; i <= 12; i++) {
                    force_majeure_by_month[i] += value[i]
                  }
                }
              })

              _forEach(currentData, (value) => {
                if (value.reason.service_location == 'operator') {
                  for (let i = 1; i <= 12; i++) {
                    operators_requests[i] += value[i]
                  }
                }
              })

              if (!total_count_by_month) { return }
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Решено удаленно ТВ {year}:
                    </Table.Summary.Cell>
                    {_map(solved_remotely_by_month, (value, key) => {
                      if (key == 'group') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value ? value : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Решено удаленно ТВ в % соотношении {year}:
                    </Table.Summary.Cell>
                    {_map(solved_remotely_by_month, (value, key) => {
                      if (key == 'group') return

                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      ИТОГО ЗАДАЧ ПО ТВ {year}:
                    </Table.Summary.Cell>
                    {_map(total_count_by_month, (value, key) => {
                      if (key == 'group') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value ? value : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Обстоятельства непреодолимой силы:
                    </Table.Summary.Cell>
                    {_map(force_majeure_by_month, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      НА СТОРОНЕ ОПЕРАТОРА:
                    </Table.Summary.Cell>
                    {_map(operators_requests, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                </>
              )
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={records_tv}
            columns={columns_for_tv_int}
            rowKey={(record) => record.reason.id}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => {
              return <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Интернет + ТВ</Text>
            }}
            summary={(currentData) => {
              const total_count_by_month = _find(summary_requests_by_group, { group: 'int_tv' })
              const solved_remotely_by_month = _find(summary_solved_remotely_requests_by_group, { group: 'int_tv' })
              let force_majeure_by_month = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              let operators_requests = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              _forEach(currentData, (value) => {
                if (_includes(value.reason.description, 'Форс-мажор') || _includes(value.reason.description, 'ППР')) {
                  for (let i = 1; i <= 12; i++) {
                    force_majeure_by_month[i] += value[i]
                  }
                }
              })

              _forEach(currentData, (value) => {
                if (value.reason.service_location == 'operator') {
                  for (let i = 1; i <= 12; i++) {
                    operators_requests[i] += value[i]
                  }
                }
              })

              if (!total_count_by_month) { return }
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Решено удаленно ИНТ + ТВ {year}:
                    </Table.Summary.Cell>
                    {_map(solved_remotely_by_month, (value, key) => {
                      if (key == 'group') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value ? value : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Решено удаленно ИНТ+ТВ в % соотношении {year}:
                    </Table.Summary.Cell>
                    {_map(solved_remotely_by_month, (value, key) => {
                      if (key == 'group') return

                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      ИТОГО ЗАДАЧ ПО ИНТ + ТВ {year}:
                    </Table.Summary.Cell>
                    {_map(total_count_by_month, (value, key) => {
                      if (key == 'group') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value ? value : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Обстоятельства непреодолимой силы:
                    </Table.Summary.Cell>
                    {_map(force_majeure_by_month, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      НА СТОРОНЕ ОПЕРАТОРА:
                    </Table.Summary.Cell>
                    {_map(operators_requests, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_count_by_month[key] > 0 ? _round((value / total_count_by_month[key]) * 100, 2) + ' %' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                </>
              )
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={records_int_tv}
            columns={columns_for_tv_int}
            rowKey={(record) => record.reason.id}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => {
              return <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Разное</Text>
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={records_other}
            columns={columns}
            rowKey={(record) => record.reason.id}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => {
              return <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Итого задач по месяцам</Text>
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={summary_data}
            columns={columns_for_summary}
            rowKey={(record) => record.record_name}
            pagination={false}
            size="small"
            bordered
          />
          <Table
            title={() => {
              return <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Итого в часовом эквиваленте</Text>
            }}
            summary={(currentData) => {
              const inside_working = _find(currentData, { record_name: 'Внутренние работы' })
              const outside_working = _find(currentData, { record_name: 'Сервисные задачи' })
              const official_working = _find(currentData, { record_name: 'Служебные' })
              const blank_slots = _find(currentData, { record_name: 'Пустые слоты' })
              let total_hours_by_month = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, total_count: 0 }
              _forEach(currentData, (record) => {
                for (let i = 1; i <= 12; i++) {
                  total_hours_by_month[i] += record[i]
                }
                total_hours_by_month['total_count'] += record['total_count']
              })
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      // colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Внутренние работы в % :
                    </Table.Summary.Cell>
                    {_map(inside_working, (value, key) => {
                      if (key == 'record_name') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >

                          {total_hours_by_month[key] > 0 ? _round(value / total_hours_by_month[key] * 100, 2) + '%' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      // colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Сервисные задачи в % :
                    </Table.Summary.Cell>
                    {_map(outside_working, (value, key) => {
                      if (key == 'record_name') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_hours_by_month[key] > 0 ? _round(value / total_hours_by_month[key] * 100, 2) + '%' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      // colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Служебные слоты в % :
                    </Table.Summary.Cell>
                    {_map(official_working, (value, key) => {
                      if (key == 'record_name') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_hours_by_month[key] > 0 ? _round(value / total_hours_by_month[key] * 100, 2) + '%' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      // colSpan={2}
                      className='summary_cell summary_cell_record_name'
                    >
                      Пустые слоты в % :
                    </Table.Summary.Cell>
                    {_map(blank_slots, (value, key) => {
                      if (key == 'record_name') return
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {total_hours_by_month[key] > 0 ? _round(value / total_hours_by_month[key] * 100, 2) + '%' : ''}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                </>
              )
            }}
            components={components}
            style={{ textAlign: 'center' }}
            dataSource={summary_data_by_time}
            columns={columns_for_summary}
            rowKey={(record) => record.record_name}
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

export default withStyles(styles)(StatisticServiceRequests);
