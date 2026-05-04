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

class ManagerSales extends Component {
  state = {
    manager_sales: [],
    tarifs: [],
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
    Rest.get('/api/v1/reports/manager_sales', { params: params }).then((response) => {
      const {
        manager_sales,
        tarifs
      } = response.data;

      this.setState({
        tarifs,
        manager_sales,
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
      manager_sales,
      tarifs,
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

    const column_from_tarifs = _map(tarifs, (tarif) => {
      return {
        align: 'center',
        title: tarif.name,
        dataIndex: tarif.name,
        key: tarif.id,
      }
    })

    const columns = [
      {
        title: 'ФИО',
        dataIndex: 'user',
        key: 'user',
        fixed: true,
        width: '12%',
        render: (value) => {
          return (value.name)
        }
      },
      ...column_from_tarifs,
    ];



    return (
      <React.Fragment>
        <Preloader loading={this.state.loading}>
          <PageHeader title="Продажи менеджеров" />
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
                </React.Fragment>
              )
            }}
            components={components}
            summary={(currentData) => {
              let summary_data = {}
              _forEach(currentData, (record) => {
                _forEach(record, (value, key) => {
                  if (key == 'user') { return }
                  summary_data[key] ? summary_data[key] += value : summary_data[key] = value
                })
              })
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      className='summary_cell summary_cell_record_name'
                    >
                      ИТОГО:
                    </Table.Summary.Cell>
                    {_map(summary_data, (value, key) => {
                      return (
                        <Table.Summary.Cell
                          key={key}
                          index={key}
                          className='summary_cell'
                        >
                          {value}
                        </Table.Summary.Cell>
                      )
                    })}
                  </Table.Summary.Row>
                </Table.Summary>
              )
            }}
            style={{ textAlign: 'center' }}
            dataSource={manager_sales}
            columns={columns}
            rowKey={(record) => record.user.id}
            pagination={false}
            size="small"
            bordered
            scroll={
              { x: true }
            }
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

export default withStyles(styles)(ManagerSales);
