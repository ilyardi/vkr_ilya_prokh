import React, { Component } from 'react';
import Rest from 'tools/rest';
import { Tabs } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  replace as _replace,
  isEqual as _isEqual,
} from 'lodash'
import Preloader from 'components/preloader';
import TimeSlotsTable from 'components/time_slots_table';
import TimeSlotsByWeek from 'components/time_slots_by_week';
import QueryMixin from 'components/query_mixin';

const { TabPane } = Tabs;

class TimeSlots extends QueryMixin {
  state = {
    date: this.getQuery('date'),
    department: this.getQuery('department') || null,
    night_shift: this.getQuery('night_shift') || null,
    active_key: this.getQuery('active_key') || 'by_day',
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Слоты', '')
  }

  componentDidMount() {
    document.title += ' | Слоты'
  }

  handleChangeParams = (params) => {
    const new_params = {
      ...this.state,
      ...params,
    }
    this.setQuery(new_params)
    this.setState(new_params)
  };

  render() {
    const {date, department, night_shift, active_key} = this.state

    return (
      <React.Fragment>
        <PageHeader
          title="Временые слоты"
        />
        <Tabs
          defaultActiveKey="by_day"
          activeKey={this.state.active_key}
          onChange={(key) => { this.handleChangeParams({ active_key: key }) }}
        >
          <TabPane key='by_day' tab='По дням'>
            {active_key == 'by_day' &&
              <TimeSlotsTable handleChangeParams={this.handleChangeParams} date={date} department={department} night_shift={night_shift} />
            }
          </TabPane>
          <TabPane key='by_week' tab='По неделям'>
            {active_key == 'by_week' &&
              <TimeSlotsByWeek handleChangeParams={this.handleChangeParams} date={date} department={department} />
            }
          </TabPane>
        </Tabs>
      </React.Fragment>
    )
  }
}

export default TimeSlots
