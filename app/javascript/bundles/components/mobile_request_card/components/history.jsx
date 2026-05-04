import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { AbilityContext, Can } from 'tools/ability';
import Rest from 'tools/rest';
import {
  ConfigProvider,
  Typography,
  Select,
  Input,
  Form,
  DatePicker,
  InputNumber,
  Checkbox,
  Button,
} from 'antd';
import {
  Popup,
  CalendarPicker,
  Checkbox as MCheckbox,
  List as MList
} from 'antd-mobile'
import { SmileFill, SmileOutline } from 'antd-mobile-icons'
import {
  CloseOutlined,
  CalendarOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { Comment } from '@ant-design/compatible';
import {
  find as _find,
  forEach as _forEach,
  map as _map,
  includes as _includes,
  findIndex as _findIndex,
  reject as _reject,
  isEqual as _isEqual,
  pull as _pull,
  concat as _concat,
} from 'lodash';
import { toast } from 'react-toastify';
import { parseISO as _parseISO, format } from 'date-fns';
import dayjs from 'dayjs';

const {Text} = Typography;
const { RangePicker } = DatePicker;

const History = (props) => {
  const { classes } = props;

  const handleClosePopup = () => {
    props.closeHistory()
  }
  const getEventItem = (record) => {
    if (Object.keys(record.changes).length == 1 && record.changes.comment) return (
      <Comment
        author={`${record.whodunnit} оставил(-а) комментарий`}
        content={
          <React.Fragment>
            <Text>{record.changes.comment} </Text>
            <br />
          </React.Fragment>
        }
        datetime={format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm')}
      />
    );
    return (
      <Comment
        author={`${record.whodunnit} ${record.event == 'create' ? 'создал(-а) задачу' : 'изменил(-а) задачу'}`}
        content={
          <React.Fragment>
            {_map(record.changes, (value, key) => {
              let field_name = ''
              let field_value = value
              switch (key) {
                case 'id':
                  field_name = "Номер: "
                  break;
                case 'request_type':
                  field_name = "Тип: "
                  break;
                case 'request_subtype':
                  field_name = "Подтип: "
                  break;
                case 'request_status':
                  field_name = "Статус: "
                  break;
                case 'request_reason':
                  field_name = "Причина закрытия: "
                  break;
                case 'description':
                  field_name = "Описание: "
                  break;
                case 'responsible_user':
                  field_name = "Автор: "
                  break;
                case 'executor_user':
                  field_name = "Исполнитель: "
                  break;
                case 'car':
                  field_name = "Автомобиль: "
                  break;
                case 'plan_started_at':
                  field_name = "Дата начала: "
                  field_value = record.changes.plan_started_at ? format(_parseISO(record.changes.plan_started_at), 'dd.MM.yyyy HH:mm') : null
                  break;
                case 'plan_finished_at':
                  field_name = "Дата завершения: "
                  field_value = record.changes.plan_finished_at ? format(_parseISO(record.changes.plan_finished_at), 'dd.MM.yyyy HH:mm') : null
                  break;
                case 'resource_identifier':
                  field_name = `Закреплена за ${record.changes['resource_type'] == 'LbAgreement' ? 'договором' : 'оборудованием'} -> `
                  break;
                case 'comment':
                  field_name = "Комментарий: "
                  break;
                default:
                  field_name = null
              }
              if (field_name) {
                return (
                  <React.Fragment key={key}>
                    <Text>{field_name + field_value}</Text>
                    <br />
                  </React.Fragment>
                )
              }
            })}
          </React.Fragment>
        }
        datetime={format(_parseISO(record.created_at), 'dd.MM.yyyy HH:mm')}
      />
    )
  }

  const size = 'large'

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelHeight: '18px',
            lineHeight: '18px',
            labelFontSize: '12px',
            verticalLabelPadding: '0',
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
        },
      }}
    >
      <Popup
        visible={props.visible}
        onMaskClick={handleClosePopup}
        onClose={handleClosePopup}
        position='right'
        bodyStyle={{
          height: "100%",
          width: '100%',
          overflowY: 'scroll',
          overflowX: 'hidden',
          // background: "linear-gradient(180deg, #FFFFFF 0%, #CDA5E6 100%)",
          backgroundColor: "#CDA5E6"
        }}
      >
        <div className={classes.main}>
          <div
            style={{
              fontSize: "30px",
              color: '#59059B',
              paddingLeft: '20px'
            }}
          >
            <CloseOutlined onClick={handleClosePopup} />
          </div>
          <div className={classes.history_block}>
            <MList>
              {props.history.map(event => (
                <MList.Item
                  key={event.id}
                  description={getEventItem(event)}
                >
                  {/* {user.name} */}
                </MList.Item>
              ))}
            </MList>
          </div>
        </div>
      </Popup>
    </ConfigProvider>
  );
};

const styles = (theme) => ({
  main: {
    width: '100%',
    margin: '20px auto',
  },
  history_block: {
    // height: '76vh',
    // height: '100%',
    width: '90%',
    margin: '20px auto',
    overflowY: 'scroll',
    overflowX: 'hidden',
    borderRadius: '20px',
  },
  menuItemLabel: {
    marginLeft: '15px',
    fontStyle: 'italic'
  },
});


const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps, null)(withStyles(styles)(History));
