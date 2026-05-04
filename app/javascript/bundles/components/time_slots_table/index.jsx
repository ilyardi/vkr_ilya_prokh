import React, { Component } from 'react';
import Rest from 'tools/rest';
import { withStyles } from '@material-ui/core/styles';
import {
  debounce,
  isEqual as _isEqual,
  forEach as _forEach,
  find as _find,
  map as _map,
  replace as _replace,
  max as _max,
  min as _min,
  takeWhile as _takeWhile,
  round as _round,
} from 'lodash';
import dayjs from 'dayjs';
import moment from 'moment'
import {
  Table,
  Select,
  Button,
  Card,
  Typography,
  Modal,
  DatePicker,
  Switch,
  Tabs,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { CheckOutlined, CaretLeftOutlined, CaretRightOutlined, BarChartOutlined } from '@ant-design/icons';
import { red, volcano, green, yellow, cyan, orange } from '@ant-design/colors';
import { parseISO as _parseISO, format } from 'date-fns';

import './index.css'
import Preloader from 'components/preloader';
import RequestCard from 'components/request_card';

const { Meta } = Card;
const { Text } = Typography;

class TimeSlotsTable extends Component {
  state = {
    time_slots: [],
    selected_daterange: {
      department: this.props.department || null,
      user_id: null,
      time_range: [],
    },
    visible_request_card: false,
    selected_request: null,
    department: this.props.department || 'service_department',
    date: (this.props.date || (this.props.time_range && this.props.time_range[0])) || moment(dayjs()).format('YYYY-MM-DD'),
    night_shift: this.props.night_shift || null,
    data_relevance: null,
    loading: false,
    is_selecting: false,
    selection_anchor: null,
  }

  departments = [
    { value: 'service_department', label: 'Сервисный отдел' },
    { value: 'connection_department', label: 'Монтажный отдел' },
    { value: 'exploitation_department', label: 'Эксплуатация сети' },
    { value: 'administrative_department', label: 'Административный отдел' },
    { value: 'car_park', label: 'Автопарк' },
  ]

  users = [];
  request_types = [];

  componentDidMount() {
    this.loadData();
    window.addEventListener('mouseup', this.handleMouseUp);
  };

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseUp = () => {
    if (this.state.is_selecting) {
      this.setState({ is_selecting: false, selection_anchor: null });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.department !== this.state.department ||
      prevState.data_relevance !== this.state.data_relevance ||
      !_isEqual(prevState.date, this.state.date) ||
      prevState.night_shift !== this.state.night_shift
    ) {
      this.loadData()
    }
  }

  loadData() {
    const { department, date, night_shift } = this.state
    const params = {
      department: department,
      // date: date,
      date: moment(date).format('YYYY-MM-DD'),
      night_shift: night_shift,
    }
    this.setState({ loading: true })
    Rest.get(`/api/v1/time_slots.json`, { params }).then(
      (response) => {
        const { time_slots, users } = response.data
        this.users = users
        this.setState({
          time_slots,
          selected_daterange: {
            ...this.state.selected_daterange,
            user_id: null,
            time_range: [],
          }
        })
        if (this.props.handleChangeParams) { this.props.handleChangeParams({ date: date, department: department, night_shift: night_shift }) }
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  closerModalRequest = () => {
    this.setState({
      visible_request_card: false,
      data_relevance: new Date(),
      selected_request: null,
    })
  };

  handleTakeTimeSlots = this.props.handleTakeTimeSlots ? this.props.handleTakeTimeSlots : (slots) => {
    this.setState({
      visible_request_card: true,
    })
  }

  render() {
    const {
      loading,
      time_slots,
      date,
      data_relevance,
      department,
      selected_daterange,
      visible_request_card,
      selected_request,
      night_shift,
    } = this.state

    const user_field_type = (this.state.department == 'car_park') ? 'car_id' : 'executor_user_id'
    const time_range_prop = this.props.time_range
    const date_picker_block = this.props.time_range && this.props.time_range[0]

    const {
      classes
    } = this.props
    const canTakeTimeSlots = selected_daterange.user_id !== null

    const users_col = _map(this.users, (user) => {
      return {
        align: 'center',
        title: user.name,
        dataIndex: user.id,
        key: user.id,
        width: '350px',
        render: (value, record) => {
          return (
            <React.Fragment>
              {_map(record.requests, (request) => {
                if ((request.user_id == user.id)) {
                  let color_card = classes['default_card']
                  switch (request.type) {
                    case 'Служебная':
                      color_card = classes['system']
                      break;
                    case 'Другое':
                      color_card = classes['other']
                  }
                  return (
                    <Card
                      key={request.id}
                      style={{ textAling: 'left', borderRadius: '15px' }}
                      className={color_card}
                      onClick={(event) => {
                        this.setState({
                          visible_request_card: true,
                          selected_request: request,
                        })
                      }}
                    >
                      <Meta
                        title={
                          <React.Fragment>
                            <Text><b>{request.type}</b> </Text>
                            {request.resource.address &&
                              <Text>{request.resource.address}<br /></Text>}
                          </React.Fragment>
                        }
                        description={
                          <React.Fragment>
                            <Text><b>Описание:</b> {request.description}</Text>
                          </React.Fragment>
                        }
                      />
                    </Card>
                  )
                }
              })}
            </React.Fragment>
          )
        },
      onCell: (record, rowIndex) => {
      let requests = []
      const cur_date = new Date(Date.parse(date))
      const year = cur_date.getFullYear();
      const month = cur_date.getMonth();
      const day = cur_date.getDate();
    
      const [cell_st_hour, cell_st_minute] = record.time.split(':').map(Number);

      const effective_day = (cell_st_hour >= 0 && cell_st_hour <= 8) ? day + 1 : day;
      const cell_st_date = new Date(year, month, effective_day, cell_st_hour, cell_st_minute, 0);
      const cell_end_date = new Date(cell_st_date.getTime() + 15 * 60000);
      _forEach(record.requests, (request) => {
        if (request.user_id == user.id) {
          requests.push(request)
        }
      })
      if (requests.length > 0) {
        if (requests.length == 1) {
          const str_date = new Date(requests[0].plan_started_at)
          const end_date = new Date(requests[0].plan_finished_at)
          let boxSize = Math.ceil((end_date - str_date) / 900000) 
          if (boxSize < 1) {boxSize = 1}
          if (cell_st_date > str_date && cell_end_date <= end_date) {boxSize = 0}
          return {
            rowSpan: boxSize
          }
        }
        return { rowSpan: 1 }
      }
      let cell_time = {
        time: record.time,
      }
      cell_time['user_id'] = user.id
      // return {
      //   cell_time: cell_time,
      //   onClick: (event) => {
      //     const current_time_range = selected_daterange.time_range
      //     const user_id = user.id
      //     let time_range = [cell_st_date, cell_end_date]
      //     if (selected_daterange.user_id == user_id) {
      //       if (_isEqual(time_range[0], current_time_range[1])) { time_range[0] = current_time_range[0] }
      //       if (_isEqual(time_range[1], current_time_range[0])) { time_range[1] = current_time_range[1] }
      //     }
      //     const new_time_range = time_range
      //     if (time_range_prop &&
      //       time_range_prop[0] &&
      //       !(new Date(time_range_prop[0]) <= new_time_range[0] && new Date(time_range_prop[1]) >= new_time_range[1])
      //       ) { return }
      //     this.setState({
      //       selected_daterange: {
      //         ...selected_daterange,
      //         user_id: user_id,
      //         time_range: new_time_range
      //       }
      //     })
      //   }
      // }  

      return {
        cell_time: cell_time,
        onMouseDown: (event) => {
          event.preventDefault();
          if (requests.length > 0) return;
          if (time_range_prop && time_range_prop[0] &&
            !(new Date(time_range_prop[0]) <= cell_st_date && new Date(time_range_prop[1]) >= cell_end_date)
          ) { return }

          const current_time_range = selected_daterange.time_range
          const user_id = user.id
          let time_range = [cell_st_date, cell_end_date]
          if (selected_daterange.user_id == user_id) {
            if (_isEqual(time_range[0], current_time_range[1])) { time_range[0] = current_time_range[0] }
            if (_isEqual(time_range[1], current_time_range[0])) { time_range[1] = current_time_range[1] }
          }
          const new_time_range = time_range

          this.setState({
            is_selecting: true,
            selection_anchor: { user_id: user.id, time: cell_st_date },
            selected_daterange: {
              ...selected_daterange,
              user_id: user_id,
              time_range: new_time_range
            }
          })
        },
        onMouseEnter: (event) => {
          if (!this.state.is_selecting || this.state.selection_anchor.user_id !== user.id) {
            return;
          }

          if (time_range_prop && time_range_prop[0] &&
            !(new Date(time_range_prop[0]) <= cell_st_date && new Date(time_range_prop[1]) >= cell_end_date)
          ) { return }

          const anchor_time = this.state.selection_anchor.time;
          const anchor_end_time = new Date(anchor_time.getTime() + 15 * 60000);

          const start_range = _min([anchor_time, cell_st_date]);
          const end_range = _max([anchor_end_time, cell_end_date]);

          this.setState({
            selected_daterange: {
              ...this.state.selected_daterange,
              time_range: [start_range, end_range]
            }
          });
        },
      }
    }
  }
})

    const columns = [
      {
        align: 'center',
        title: 'Время',
        dataIndex: 'time',
        key: 'time',
        fixed: 'left',
        width: '100px',
        render: (value, record) => {
          return value; // Принимаем готовое значение времени из API в формате "HH:mm"
        }
      },
      ...users_col
    ];

    const components = {
      header: {
        cell: ({ style, ...restProps }) => {
          return (
            <th
              style={{
                borderColor: 'black',
                textAlign: 'center'
              }}
              {...restProps}
            />
          )
        }
      },
      body: {
        row: ({ className, ...restProps }) => {
          return (
            <tr
              className={'time-slots-row'}
              {...restProps}
            />
          )
        },
        cell: ({ cell_time, style, children, className, ...restProps }) => {
          let newClassName = className + ' time-slot-cell'

          const cur_date = new Date(Date.parse(date))
          const year = cur_date.getFullYear();
          const month = cur_date.getMonth();
          const day = cur_date.getDate();

          const [cell_hour, cell_minute] = cell_time?.time?.split(':').map(Number) || [0, 0];
          const real_cell_time = new Date(year, month, (cell_hour >= 0 && cell_hour < 9) ? day + 1 : day, cell_hour, cell_minute, 0);

          if (
            time_range_prop && time_range_prop[0] &&
            (real_cell_time < new Date(time_range_prop[0]) || real_cell_time >= new Date(time_range_prop[1]))
          ) { newClassName += ' blocked'}

          if (cell_time &&
            cell_time.user_id == selected_daterange.user_id &&
            real_cell_time >= selected_daterange.time_range[0] &&
            real_cell_time < selected_daterange.time_range[1]
          ) { newClassName = newClassName + ' selected_slot' }

          // const hour_range = (time_range_prop && time_range_prop[0]) ? [new Date(time_range_prop[0]).getHours(), new Date(time_range_prop[1]).getHours()] : null

          // if (
          //   hour_range && cell_time &&
          //   (cell_time.time < hour_range[0] ||
          //   cell_time.time >= hour_range[1])
          // ) { newClassName += ' blocked'}

          // if (
          //   cell_time &&
          //   cell_time.user_id == selected_daterange.user_id &&
          //   cell_time.time >= selected_daterange.time_range[0].getHours() &&
          //   cell_time.time < selected_daterange.time_range[1].getHours()
          // ) { newClassName = newClassName + ' selected_slot' }

          return (
            <td
              className={newClassName}
              style={{ borderColor: 'black', textAlign: 'center' }}
              children={children}
              {...restProps}
            />
          );
        },
      },
    };
    return (
      <Preloader loading={loading} >
        {visible_request_card &&
          <Modal
            title={
              <Text style={{ fontWeight: 'bold' }}>Задача</Text>
            }
            visible={visible_request_card}
            onCancel={this.closerModalRequest}
            onOk={this.closerModalRequest}
            footer={false}
            width={'80%'}
          >
            {selected_request ?
              <RequestCard request_id={selected_request.id} />
              :
              <RequestCard
                plan_do_daterange={selected_daterange.time_range}
                executor_user_id={(department == 'car_park') ? null : selected_daterange.user_id}
                car_id={(department == 'car_park') ? selected_daterange.user_id : null}
              />
            }
          </Modal>}
        <Table
          title={(currentPageDate) => {
            return (
              <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-around' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '20%', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '14pt', verticalAlign: 'middle', textAlign: 'center' }}>
                    Подразделение
                  </Text>
                  <Select
                    value={department}
                    onChange={(value, option) => {
                      this.setState({ department: value })
                    }}
                    options={this.departments}
                    disabled={this.props.department_disabled}
                  />
                </div>
                <div style={{ width: '80%', marginLeft: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-evenly', paddingBottom: '5px' }}>
                    <Button
                      onClick={(event) => {
                        this.setState({
                          date: dayjs(date).subtract(1, 'days').format('YYYY-MM-DD')
                        });
                      }}
                      icon={<CaretLeftOutlined />}
                      disabled={date_picker_block}
                    />
                    <DatePicker
                      value={date ? dayjs(date) : null}
                      style={{ border: 'none' }}
                      size='large'
                      allowClear={false}
                      format={'dddd, DD MMMM YYYY г.'}
                      onChange={(date, dateString)=>{
                        this.setState({ date: date ? date.format('YYYY-MM-DD') : null})
                      }}
                      disabled={date_picker_block}
                    />
                    <Button
                      onClick={(event) => {
                        this.setState({
                          date: dayjs(date).add(1, 'days').format('YYYY-MM-DD')
                        });
                      }}
                      icon={<CaretRightOutlined />}
                      disabled={date_picker_block}
                    />
                  </div>
                  <div style={{ display: 'flex', paddingTop: '5px', alignItems: 'center' }}>
                    <Button
                      type={'primary'}
                      disabled={!canTakeTimeSlots}
                      onClick={(event) => this.handleTakeTimeSlots(selected_daterange)}
                    >
                      Занять слоты
                    </Button>
                    <Switch
                      style={{marginLeft: '10px'}}
                      checkedChildren="Ночь"
                      unCheckedChildren="День"
                      // defaultChecked = {null}
                      checked={night_shift}
                      onChange={(checked) => {
                        this.setState({night_shift: checked ? true : null})
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          }}
          components={components}
          rowKey={'time'}
          columns={columns}
          dataSource={time_slots}
          bordered
          pagination={false}
        />
      </Preloader>
    )
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
  default_card: {
    backgroundColor: orange[1],
  },
  system: {
    backgroundColor: cyan[1],
  },
  other: {
    backgroundColor: '#d9d9d9'
  },
});

export default withStyles(styles)(TimeSlotsTable)
