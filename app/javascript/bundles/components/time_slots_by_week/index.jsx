import React, { Component, useState, useEffect, useContext } from 'react';
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
import {
  Table,
  Select,
  Button,
  Card,
  Typography,
  Modal,
  DatePicker,
  Switch,
  Row,
  Col,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { CheckOutlined, CaretLeftOutlined, CaretRightOutlined, BarChartOutlined } from '@ant-design/icons';
import { red, volcano, green, yellow, cyan, orange } from '@ant-design/colors';
import { parseISO as _parseISO, format } from 'date-fns';

import './index.css'
import RequestCard from 'components/request_card';

var weekYear = require('dayjs/plugin/weekYear')
var weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)

const { Text, Link } = Typography
const { Meta } = Card

const TimeSlotsByWeek = (props)=> {
  const [date, setDate] = useState(props.date ? dayjs(props.date) : dayjs())
  const [department, setDepartment] = useState(props.department || 'service_department');
  const [timeSlots, setTimeSlots] = useState({});
  const [users, setUsers] = useState([]);
  const [hoursOfDay, setHoursOfDay] = useState([]);
  const [request_id, setRequestId] = useState(null);
  const [visibleRequest, setVisibleRequest] = useState(false);
  const [selectedDaterange, setSelectedDaterange] = useState({
    user_id: null,
    time_range: [],
  });

  const departments = [
    { value: 'service_department', label: 'Сервисный отдел' },
    { value: 'connection_department', label: 'Монтажный отдел' },
    { value: 'exploitation_department', label: 'Эксплуатация сети' },
    { value: 'administrative_department', label: 'Административный отдел' },
    { value: 'car_park', label: 'Автопарк' },
  ];

  const loadData = () => {
    const params = {
      date: date.format('YYYY-MM-DD'),
      department: department
    }
    if (props.handleChangeParams) {props.handleChangeParams(params)}
    Rest.get(`/api/v1/time_slots/slots_by_week.json`, { params }).then(
      (response) => {
        setUsers(response.data.users)
        setHoursOfDay(response.data.working_hours)
        setTimeSlots(response.data.time_slots)
      }).catch((e) => {
        console.error('error', e);
      })
      .finally(() => {
      });
  };

  const closerModalRequest = () => {
    setVisibleRequest(false);
    setRequestId(null);
  };

  useEffect(() => {
    loadData();
  }, [date, department]);

  return (
    <React.Fragment>
      {visibleRequest &&
        <Modal
          title={
            <Text style={{ fontWeight: 'bold' }}>Задача</Text>
          }
          visible={visibleRequest}
          onCancel={closerModalRequest}
          onOk={closerModalRequest}
          footer={false}
          width={'80%'}
        >
          {request_id ?
            <RequestCard request_id={request_id} />
            :
            <RequestCard
              plan_do_daterange={selectedDaterange.time_range}
              executor_user_id={(department == 'car_park') ? null : selectedDaterange.user_id}
              car_id={(department == 'car_park') ? selectedDaterange.user_id : null}
            />
          }
        </Modal>}
      <div style={{ backgroundColor: 'white' }}>
        <div style={{padding: '16px', display: 'flex'}}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '20%', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '14pt', verticalAlign: 'middle', textAlign: 'center' }}>
              Подразделение
            </Text>
            <Select
              value={department}
              onChange={(value, option) => { setDepartment(value) }}
              options={departments}
            />
          </div>
          <div style={{ width: '80%', marginLeft: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-evenly', paddingBottom: '5px' }}>
              <Button
                onClick={(event) => { setDate(dayjs(date).subtract(7, 'days')) }}
                icon={<CaretLeftOutlined />}
              />
              <DatePicker
                value={date}
                onChange={(value, dateString) => {
                  setDate(value)
                }}
                picker="week"
              />
              <Button
                onClick={(event) => { setDate(dayjs(date).add(7, 'days')) }}
                icon={<CaretRightOutlined />}
              />
            </div>
            <div style={{ display: 'flex', paddingTop: '5px', alignItems: 'center' }}>
              <Button
                type={'primary'}
                disabled={!selectedDaterange?.user_id}
                onClick={(event) => {setVisibleRequest(true)}}
              >
                Занять слоты
              </Button>
            </div>
          </div>
        </div>
        <table cellSpacing={'1'} border='1' cellPadding={'0'} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead
            className='scrolling_thead'
            style={{ position: 'sticky', top: '0', backgroundColor: 'white', height: "30px" }}
          >
            <tr>
              <th colSpan={2} >День</th>
              {_map(users, (user) => {
                return (
                  <th style={{ width: `${100 / users.length}%` }}>{user.name}</th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {_map(timeSlots, (users_in_day, day_of_week) => (
              <>
                {_map(hoursOfDay, (hour, index) => (
                  <tr className='hovered_row'>
                    {(index == 0) ?
                      <td rowSpan={hoursOfDay.length} style={{ writingMode: 'vertical-lr', textAlign: 'center', backgroundColor: 'white' }}>
                        <b>{date.set('date', day_of_week).format('dddd, D MMMM')}</b>
                      </td>
                      :
                      <></>}
                    <td style={{ textAlign: 'center', padding: '2px' }}>
                      {typeof hour === 'object' ? `${hour.hour}:${hour.minute.toString().padStart(2, '0')}` : hour}
                    </td>
                    {_map(users_in_day, (user_slots, user_id) => {
                      if (user_slots.weekend && index == 0) {
                        return (
                          <td
                            className='hovered_cell'
                            rowSpan={hoursOfDay.length}
                            style={{ width: `${100 / users.length}%`, textAlign: 'center', backgroundColor: 'lightgray' }}
                          >
                            Выходной
                          </td>
                        )
                      }
                      if (user_slots[hour] && (user_slots[hour].request_ids.length > 0)) {
                        return (
                          <td
                            className='hovered_cell'
                            rowSpan={user_slots[hour].box_size}
                            style={{ width: `${100 / users.length}%`, backgroundColor: 'bisque' }}
                          >
                            {_map(user_slots[hour].request_ids, (value) => (
                              <Link
                                style={{ marginLeft: '5px' }}
                                onClick={(event) => {
                                  setRequestId(value)
                                  setVisibleRequest(true)
                                }}
                              >
                                {value}
                              </Link>
                            ))}
                          </td>
                        )
                      }
                      else if (user_slots[hour] && (user_slots[hour].request_ids.length == 0)) {
                        const cur_date = new Date(date)
                        const year = cur_date.getFullYear();
                        const month = cur_date.getMonth();

                        const cell_st_time = hour
                        const cell_end_time = cell_st_time == 23 ? 0 : cell_st_time + 1
                        const cell_st_date = new Date(year, month, (cell_st_time >= 0 && cell_st_time <= 8) ? day_of_week + 1 : day_of_week, cell_st_time, 0, 0)
                        const cell_end_date = new Date(year, month, (cell_end_time >= 0 && cell_end_time <= 9) ? day_of_week + 1 : day_of_week, cell_end_time, 0, 0)

                        const current_time_range = selectedDaterange.time_range
                        let time_range = [cell_st_date, cell_end_date]
                        if (selectedDaterange.user_id == user_id) {
                          if (_isEqual(time_range[0], current_time_range[1])) { time_range[0] = current_time_range[0] }
                          if (_isEqual(time_range[1], current_time_range[0])) { time_range[1] = current_time_range[1] }
                        }
                        const new_time_range = time_range

                        let class_name = ''
                        if (
                          user_id == selectedDaterange.user_id &&
                          cell_st_date >= selectedDaterange.time_range[0] &&
                          cell_st_date < selectedDaterange.time_range[1]
                        ) {
                          class_name = ' selected_slot'
                        }

                        return (
                          <td
                            style={{ width: `${100 / users.length}%`, backgroundColor: 'lightgreen' }}
                            className={'hovered_cell' + class_name}
                            onClick={(event) => {
                              setSelectedDaterange({
                                user_id: Number(user_id),
                                time_range: new_time_range,
                              })
                            }}
                          >
                          </td>
                        )
                      }
                      else {
                        return
                      }
                    })
                    }
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  )
}

export default TimeSlotsByWeek

