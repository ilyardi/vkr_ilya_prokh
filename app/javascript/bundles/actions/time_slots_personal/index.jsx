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
} from 'lodash';
import {
  Table,
  Select,
  List,
  Button,
  Card,
  Typography,
  Divider,
  Modal
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { LogoutOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { red, volcano, green, yellow } from '@ant-design/colors';
import Preloader from 'components/preloader';
import RequestCard from 'components/request_card';
import QueryMixin from 'components/query_mixin';
import './index.css'
import dayjs from 'dayjs';

const { Meta } = Card;
const { Text } = Typography;

class TimeSlotsPersonal extends QueryMixin {
  state = {
    loading: false,
    date: this.getQuery('date') || new Date(),
    requests: [],
    time_slots: [
      { start_time: 9 },
      { start_time: 10 },
      { start_time: 11 },
      { start_time: 12 },
      { start_time: 13 },
      { start_time: 14 },
      { start_time: 15 },
      { start_time: 16 },
      { start_time: 17 },
      { start_time: 18 },
      { start_time: 19 },
      { start_time: 20 },
    ],
    data_relevance: null,
    visible_request_card: false,
    selected_request: null,
    loading: false,
  }

  componentDidMount() {
    this.loadData();
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.data_relevance !== this.state.data_relevance) {
      this.loadData();
      this.setQuery({
        date: this.state.date
      });
    }
  }

  loadData() {
    const { date } = this.state
    const params = {
      date: date,
    }
    this.setState({ loading: true })
    Rest.get(`/api/v1/time_slots/personal.json`, { params }).then(
      (response) => {
        const { requests } = response.data
        this.setState({
          requests
        })
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
    })
  };

  handleChangeDate = (event) => {
    let newDate = this.state.date
    newDate.setDate(newDate.getDate() + (event.currentTarget.name == 'up' ? 1 : -1))
    this.setState({
      date: newDate,
      data_relevance: new Date()
    })
  }

  render() {
    const {
      loading,
      time_slots,
      requests,
      date,
      visible_request_card,
      selected_request
    } = this.state

    const h_request = 72
    const h_in_minut = 7

    const {
      classes
    } = this.props

    let start_position = 0

    return (
      <Preloader loading={loading}>
        <div className='time_slots_mobile' style={{marginTop: '20px'}}>
          <React.Fragment>
            {visible_request_card &&
              <Modal
                title={
                  <Text>Задача</Text>
                }
                visible={visible_request_card}
                onCancel={this.closerModalRequest}
                onOk={this.closerModalRequest}
                footer={false}
                className='mobile_modal'
              >
                {selected_request &&
                  <RequestCard
                    request_id={selected_request.id}
                  />
                }
              </Modal>}
            <div className='date-switcher'>
              <Button
                name='down'
                onClick={this.handleChangeDate}
                icon={<CaretLeftOutlined className='date-switcher-icon' />}
              />
              <Text className='date-show'>
                {date.toLocaleDateString('ru', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                })}
              </Text>
              <Button
                name='up'
                onClick={this.handleChangeDate}
                icon={<CaretRightOutlined className='date-switcher-icon' />}
              />
            </div>
            <div style={{ display: 'flex' }}>
              <div className='timeColomn'>
                {_map(time_slots, (slot) => {
                  return (
                    <div className='times_cell' style={{ height: `${h_in_minut * 60}px` }} key={slot.start_time}>
                      <div className='intervals'>
                        <div style={{ height: `${h_in_minut * 10}px` }}>{slot.start_time + ':00'}</div>
                        <div style={{ height: `${h_in_minut * 10}px` }}>{slot.start_time + ':10'}</div>
                        <div style={{ height: `${h_in_minut * 10}px` }}>{slot.start_time + ':20'}</div>
                        <div style={{ height: `${h_in_minut * 10}px` }}>{slot.start_time + ':30'}</div>
                        <div style={{ height: `${h_in_minut * 10}px` }}>{slot.start_time + ':40'}</div>
                        <div style={{ height: `${h_in_minut * 10}px` }}>{slot.start_time + ':50'}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className='requestColumn'>
                {_map(requests, (request) => {
                  let card_class_name = ''
                  if (request && request.status_notified_at) { card_class_name = classes['danger'] }
                  if (request && request.status == 'Выполнена') { card_class_name = classes['success'] }
                  const minutes = dayjs(request.plan_finished_at).diff(dayjs(request.plan_started_at), 'minute')
                  const minutes_from_st_day = dayjs(request.plan_started_at).diff(dayjs(date).hour(9).minute(0), 'minutes')
                  const card_h = h_in_minut * Math.round(minutes * 0.1) * 10
                  const card_offset = h_in_minut * Math.round(minutes_from_st_day * 0.1) * 10 - start_position
                  start_position += card_h
                  return (
                    <Card
                      style={{ height: `${card_h}px`, position: 'relativ', top: `${card_offset}px` }}
                      key={request.id}
                      className={'request-card ' + card_class_name}
                      onClick={(event) => {
                        this.setState({
                          visible_request_card: true,
                          selected_request: request,
                        })
                      }}
                    >
                      <p><b>{request.type}</b> {request.resource && request.resource.address}</p>
                      <p style={{ overflow: 'hidden', maxHeight: `${card_h - 50}px`, margin: '0' }}>
                        <b>Описание: </b>{request.description}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          </React.Fragment>
        </div>
      </Preloader >
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
});

export default withStyles(styles)(TimeSlotsPersonal)
