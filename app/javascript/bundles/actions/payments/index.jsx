import React, { Component } from "react";
import { isEqual, replace as _replace } from "lodash";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableFooter,
  Paper,
} from "@material-ui/core";

import PaymentRow from "./components/row";
import LoadPaymentsModal from "./components/load_payments_modal";
import Rest from "tools/rest";
import { Link } from "react-router-dom";

import dayjs from 'dayjs';
import { FloatButton, DatePicker, Select, Button, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';

class Payments extends Component {
  state = {
    payments: [],
    meta: {},
    headerMenuEl: null,
    filter: {
      status: "empty",
      ofd_status: "all",
      source_type: "all",
    },
  };

  statuses = [
    { value: "all", label: "Все" },
    { value: "empty", label: "Не загружен" },
    { value: "error", label: "Ошибка" },
    { value: "done", label: "Загружен" },
    { value: "cancelled", label: "Аннулированные" },
    { value: "unprocessable", label: "Необработанные" },
  ];
  ofd_statuses = [
    { value: "all", label: "Все" },
    { value: "ofd_empty", label: "Не загружен" },
    { value: "ofd_error", label: "Ошибка" },
    { value: "ofd_done", label: "Загружен" },
    { value: "ofd_unprocessable", label: "Необработанные" },
  ];
  source_types = [
    { value: "all", label: "Все" },
    { value: "irc", label: "ИРЦ" },
    { value: "sber", label: "Сбербанк" },
    { value: "rschet", label: "Р/С" },
    { value: "minbank_ones", label: "МИНБанк самообслуж." },
  ];

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Загр. платежи', '')
  }

  componentDidMount() {
    document.title += ' | Загр. платежи'
    this.loadPayments(1);
  }

  handleChangePage = (e, page) => {
    this.loadPayments(page + 1);
  };

  handleChangeRowsPerPage = (e) => {
    this.loadPayments(this.state.meta.page, e.target.value);
  };

  handleFilter = (name) => (event) => {
    this.setState({
      filter: { ...this.state.filter, [name]: event.target.value },
    });
  };

  handleDateFilter = (name) => (value) => {
    let dates = null;
    if (Array.isArray(value)) {
      dates = value.map((d) => {
        return d ? d.format("DD.MM.YYYY") : null;
      });
    } else {
      dates = value ? value.format("DD.MM.YYYY") : null;
    }
    this.setState({
      filter: { ...this.state.filter, [name]: dates },
    });
  };

  handleSelectFilter = (name) => (value, _) => {
    this.setState({
      filter: { ...this.state.filter, [name]: value },
    });
  };

  loadPayments = (page, per = this.state.meta.per) => {
    let params = {
      page: page,
      per: per,
      filter: this.state.filter,
    };

    Rest.get("/api/v1/payments.json", { params: params }).then((response) => {
      this.setState(response.data);
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!isEqual(prevState.filter, this.state.filter)) {
      this.loadPayments(1);
    }
  };

  handleHeaderMenuClick = (event) => {
    this.setState({ headerMenuEl: event.currentTarget });
  };

  handleHeaderMenuClose = () => {
    this.setState({ headerMenuEl: null });
  };

  render() {
    const { classes } = this.props;
    const { filter } = this.state;

    return (
      <React.Fragment>
        <FloatButton.BackTop />

        <PageHeader
          title="Загруженные платежи"
          extra={[
            <Button key="payments/report">
              <Link to={"/payments/report"}>Все платежи</Link>
            </Button>,
            <LoadPaymentsModal />,
          ]}
        />

        <div className={classes.tableContainer}>
          <Paper>
            <Table className={classes.table} padding="checkbox">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell className={classes.nowrap}>Лицевой счет</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>ОФД Статус</TableCell>
                  <TableCell>Источник</TableCell>
                  <TableCell>Банк</TableCell>
                  <TableCell className={classes.nowrap}>Дата платежа</TableCell>
                  <TableCell className={classes.nowrap}>
                    Дата загрузки
                  </TableCell>
                  <TableCell className={classes.nowrap}>LB ID</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <Input
                      value={filter.account_number}
                      placeholder="Лицевой счет"
                      onChange={this.handleFilter("account_number")}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Input
                      value={filter.amount}
                      placeholder="Сумма"
                      onChange={this.handleFilter("amount")}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={filter.status}
                      style={{ width: 200 }}
                      onChange={this.handleSelectFilter("status")}
                    >
                      {this.statuses.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={filter.ofd_status}
                      style={{ width: 200 }}
                      onChange={this.handleSelectFilter("ofd_status")}
                    >
                      {this.ofd_statuses.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={filter.source_type}
                      style={{ width: 200 }}
                      onChange={this.handleSelectFilter("source_type")}
                    >
                      {this.source_types.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={filter.banknam}
                      placeholder="Банк"
                      onChange={this.handleFilter("banknam")}
                    />
                  </TableCell>
                  <TableCell>
                    <DatePicker
                      format={"DD.MM.YYYY"}
                      value={
                        filter.paid_at
                          ? dayjs(filter.paid_at, "DD.MM.YYYY")
                          : null
                      }
                      onChange={this.handleDateFilter("paid_at")}
                    />
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.payments.map((p) => {
                  return (
                    <PaymentRow key={p.id} payment={p} classes={classes} />
                  );
                })}
              </TableBody>
              {this.state.meta.page && (
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      colSpan={10}
                      count={this.state.meta.total}
                      rowsPerPage={this.state.meta.per}
                      page={this.state.meta.page - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                      rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]}
                    />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </Paper>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  nowrap: {
    whiteSpace: "nowrap",
  },
  filterSourceType: {
    width: "150px",
  },
});

Payments.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Payments);
