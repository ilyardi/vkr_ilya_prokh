import React, { Component } from 'react';
import Rest from 'tools/rest';
import { AbilityContext, Can } from 'tools/ability';
import {
  debounce,
  isEqual as _isEqual,
  forEach as _forEach,
  find as _find,
  includes as _includes,
  replace as _replace,
  map as _map,
  remove as _remove,
} from 'lodash';
import dayjs from 'dayjs';
import moment from 'moment'
import {
  Table,
  Select,
  Button,
  Typography,
  Tooltip,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { toast } from 'react-toastify';
import { CheckOutlined, CaretLeftOutlined, CaretRightOutlined, BarChartOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { parseISO as _parseISO, format } from 'date-fns';
import './index.css'

const { Text } = Typography

class WorkSchedules extends Component {
  state = {
    schedules: {},
    date: new Date(),
    data_relevance: false,
    loading: false,
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Рабочий график', '')
  }

  componentDidMount() {
    document.title += ' | Рабочий график'
    this.loadData()
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.working_group !== this.state.working_group ||
      !this.state.data_relevance
    ) {
      this.loadData()
    }
  }

  loadData() {
    const params = {
      date: this.state.date,
    }
    this.setState({ loading: true, data_relevance: true })
    Rest.get(`/api/v1/working_days.json`, { params }).then(
      (response) => {
        const { schedules } = response.data
        this.setState({ schedules })
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleCreateWorkingDay = (working_day) => {
    if (!this.context.can('create', 'WorkingDay')) {
      toast.error("Недостаточно прав для совершения операции");
      return
    }
    const params = {
      working_day: working_day,
    }
    this.setState({ loading: true })
    Rest.post(`/api/v1/working_days`, params).then(
      (response) => {
        const { working_day, department } = response.data
        let new_schedules = this.state.schedules
        new_schedules[department] = _map(new_schedules[department], (user)=> {
          if (user.user_id == working_day.user_id) {
            user['working_days'] = [...user['working_days'], working_day]
          }
          return user
        })
        this.setState({schedules: new_schedules})
        toast.success('Рабочий день успешно создан');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleDestroyWorkingDay = (working_day) => {
    if (!this.context.can('destroy', 'WorkingDay')) {
      toast.error("Недостаточно прав для совершения операции");
      return
    }
    this.setState({ loading: true })
    Rest.delete(`/api/v1/working_days/${working_day?.id}`).then(
      (response) => {
        const { working_day, department } = response.data
        let new_schedules = this.state.schedules
        new_schedules[department] = _map(new_schedules[department], (user) => {
          if (user.user_id == working_day.user_id) {
            let new_working_days = user['working_days']
            _remove(new_working_days, (day) => {
              return day.id == working_day.id
            });
            user['working_days'] = new_working_days
          }
          return user
        })
        this.setState({ schedules: new_schedules })
        toast.success('Рабочий день успешно удален');
      }).catch((e) => {
        console.log(e.response.data.errors)
        toast.error("Невозможно удалить рабочий день!");
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handlePushAllDays = (user_id) => {
    if (!this.context.can('fill_month', 'WorkingDay')) {
      toast.error("Недостаточно прав для совершения операции");
      return
    }
    const params = {
      user_id: user_id,
      date: this.state.date
    }
    this.setState({ loading: true })
    Rest.post(`/api/v1/working_days/fill_month.json`, params).then(
      (response) => {
        const { working_days, department } = response.data
        let new_schedules = this.state.schedules
        new_schedules[department] = _map(new_schedules[department], (user) => {
          if (user.user_id == user_id) {
            user['working_days'] = working_days
          }
          return user
        })
        this.setState({ schedules: new_schedules })
        toast.success('График успешно заполнен');
      }).catch((e) => {
        console.error('error', e);
        toast.error('Ошибка сохранения');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleDownMonth = (event) => {
    let date = this.state.date
    date.setMonth(date.getMonth() - 1)
    this.setState({ date })
  }

  getDaysInCurrentMonth = () => {
    const { date } = this.state
    return 33 - new Date(date.getFullYear(), date.getMonth(), 33).getDate()
  };

  render() {
    const { loading, schedules, working_group, date } = this.state
    let days = [];
    for (let i = 1; i <= this.getDaysInCurrentMonth(); i++) {
      const weekday = new Date(date.getFullYear(), date.getMonth(), i).toLocaleString('ru', {
        weekday: 'short',
      })
      days.push({
        align: 'center',
        title: i,
        dataIndex: i,
        key: i,
        className: (weekday == 'вс') || (weekday == 'сб') ? 'weekend' : 'schedule-cell',
        render: (_, record) => {
          return (_find(record.working_days, (value) => {
            if (value?.date) {
              return moment(value.date).date() == i
            }
            return false
          }) ?
            <CheckOutlined style={{ fontSize: '12pt' }} />
            :
            '')
        },
        onCell: (record, rowIndex) => {
          return {
            onClick: event => {
              // if (_includes(event.currentTarget.className, 'weekend')) { return }
              if (_includes(event.currentTarget.className, 'working')) {
                const selected_day = _find(record.working_days, (day) => {
                  return moment(day.date).date() == event.currentTarget.cellIndex
                })
                this.handleDestroyWorkingDay(selected_day)
              }
              else {
                let day = new Date(date.getFullYear(), date.getMonth(), event.currentTarget.cellIndex)
                const working_day = {
                  user_id: record.user_id,
                  date: day
                };
                this.handleCreateWorkingDay(working_day)
              };
            },
          }
        }
      });
    }

    const columns = [
      {
        title: (object) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <Text style={{ fontSize: '14pt', verticalAlign: 'middle', textAlign: 'center'}}>
                ФИО
              </Text>
            </div>
          )
        },
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: '20%',
        render: (value,record) => {
          return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text>{value}</Text>
              <Can do="fill_month" on="WorkingDay">
                <Tooltip title="Заполнить месяц">
                  <Button
                    icon={<DoubleRightOutlined />}
                    onClick={(value) => {
                      this.handlePushAllDays(record.user_id)
                    }}
                  />
                </Tooltip>
              </Can>
            </div>
          )
        }
      },
      ...days,
      {
        title: (object) => {
          return <BarChartOutlined style={{ fontSize: '12pt' }} />
        },
        align: 'center',
        width: '3%',
        dataIndex: 'working_days',
        key: 'working_days',
        fixed: 'right',
        render: (value, record) => {
          return value.length
        }
      }
    ];

    const components = {
      body: {
        row: ({ className, ...restProps }) => {
          return (
            <tr
              className='schedule-row'
              {...restProps}
            />
          )
        },
        cell: ({ children, className, ...restProps }) => {
          let newClassName = _replace(className, ' ant-table-cell-row-hover', '')
          newClassName = (_includes(newClassName, 'schedule-cell') || _includes(newClassName, 'weekend')) && children[1] ?
            newClassName + ' working'
            :
            newClassName
          return (
            <td
              className={newClassName}
              children={children}
              {...restProps}
            />
          );
        },
      },
    };
    return (
      <React.Fragment>
        <PageHeader
          title="Рабочий график сотрудников"
        />
          <Table
            title={() => (
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                <div style={{ textAlign: 'center', fontSize: '24px' }}>Сервисная служба</div>
                <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '70%' }}>
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
            </div>
            )}
            rowKey={(record) => { return record.user_id }}
            columns={columns}
            dataSource={schedules?.service_department}
            components={components}
            loading={loading}
            bordered
            pagination={false}
            scroll={{
              x: true,
            }}
          />
          <Table
            title={() => <div style={{ textAlign: 'center', fontSize: '24px' }}>Монтажники сетей связи</div>}
            showHeader={false}
            rowKey={(record) => { return record.user_id }}
            columns={columns}
            dataSource={schedules?.connection_department}
            components={components}
            loading={loading}
            bordered
            pagination={false}
            scroll={{
              x: true,
            }}
          />
          <Table
            title={() => <div style={{ textAlign: 'center', fontSize: '24px' }}>Эксплуатация сети</div>}
            showHeader={false}
            rowKey={(record) => { return record.user_id }}
            columns={columns}
            dataSource={schedules?.exploitation_department}
            components={components}
            loading={loading}
            bordered
            pagination={false}
            scroll={{
              x: true,
            }}
          />
          <Table
            title={() => <div style={{ textAlign: 'center', fontSize: '24px' }}>Административный сегмент</div>}
            showHeader={false}
            rowKey={(record) => { return record.user_id }}
            columns={columns}
            dataSource={schedules?.administrative_department}
            components={components}
            loading={loading}
            bordered
            pagination={false}
            scroll={{
              x: true,
            }}
          />
          <Table
            title={() => <div style={{ textAlign: 'center', fontSize: '24px' }}>Авто-парк</div>}
            showHeader={false}
            rowKey={(record) => { return record.user_id }}
            columns={columns}
            dataSource={schedules?.car_park}
            components={components}
            loading={loading}
            bordered
            pagination={false}
            scroll={{
              x: true,
            }}
          />
      </React.Fragment>
    )
  }
}

WorkSchedules.contextType = AbilityContext;

export default WorkSchedules
