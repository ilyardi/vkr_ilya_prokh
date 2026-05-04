import React, { Component, Fragment } from "react";
import {
  isEqual as _isEqual,
  map as _map,
  sumBy as _sumBy,
  forEach as _forEach,
  replace as _replace,
} from "lodash";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  TableFooter,
} from "@material-ui/core";
import PropTypes from "prop-types";
import Rest from "tools/rest";
import dayjs from 'dayjs';
import Preloader from "components/preloader";
import { withStyles } from "@material-ui/core/styles";

const YEARS = [
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
];
const MONTHS = dayjs.months().map((m, i) => {
  return { id: i + 1, label: m };
});

class ConnectionSource extends Component {
  state = {
    grouped_str_values: {},
    grouped_by_usluga: {},
    vgroups: [],
    meta: {},
    filter: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
    rows: [
      { id: "str_value", label: "Причина" },
      { id: "bill_delivery", label: "Способ счета" },
      { id: "address", label: "Адрес" },
      { id: "number", label: "Номер" },
      { id: "tarif", label: "Тариф" },
      { id: "lk_status", label: "Статус ЛК" },
      { id: "usluga", label: "Услуга" },
      { id: "acc_ondate", label: "Дата" },
    ],
    loaded: false,
  };

  bill_deliveries_enum = ['-', 'Бумажный', 'Элект+бумажн.', 'Другое', 'Электронный']
  lk_statuses_hash = {
    no_lk: 'Без ЛК',
    confirmed_lk: 'ПЛК',
    unconfirmed_lk: 'ЛК',
  }

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Подключение', '')
  }

  componentDidMount() {
    document.title += ' | Подключение'
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_isEqual(prevState.filter, this.state.filter)) {
      this.loadData();
    }

    if (!_isEqual(prevState.vgroups, this.state.vgroups)) {
      this.generateGrouped();
    }
  }

  generateGrouped = () => {
    const { vgroups } = this.state;

    let grouped = {};
    vgroups.forEach((el) => {
      const usluga = el.usluga == "ТВ" ? "tv" : "int";
      const index = el.str_value == '-' ? null : el.str_value
      if (!grouped[index]) grouped[index] = { total: 0 };
      if (!grouped[index][usluga]) grouped[index][usluga] = 0;
      grouped[index][usluga] += 1;
      grouped[index].total += 1;
    });

    this.setState({
      grouped,
    });
  };

  loadData = () => {
    const { filter } = this.state;

    this.setState({ loaded: false });

    let params = {
      filter,
    };

    Rest.get("/api/v1/reports/connection_source.json", { params: params }).then(
      (response) => {
        const { data } = response;
        const { vgroups, meta } = data;

        this.setState({
          vgroups,
          meta,
          loaded: true,
        });
      }
    );
  };

  handleFilter = (event) => {
    this.setState({
      filter: { ...this.state.filter, [event.target.name]: event.target.value },
    });
  };

  render() {
    const { classes } = this.props;
    const { loaded, vgroups, grouped, filter, rows } = this.state;

    let totalSum = { total: 0, tv: 0, int: 0 };

    _forEach(grouped, (v, k) => {
      if (k == "null") return;
      totalSum.total += v.total;
      totalSum.tv += v.tv || 0;
      totalSum.int += v.int || 0;
    });

    return (
      <Fragment>
        <Typography variant="h4" gutterBottom component="h1">
          Причины подключения
        </Typography>
        <Grid container>
          <TextField
            id="year"
            name="year"
            select
            label="Год"
            className={classes.textField}
            value={filter.year}
            onChange={this.handleFilter}
            margin="none"
            variant="filled"
          >
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="month"
            name="month"
            select
            label="Месяц"
            className={classes.textField}
            value={filter.month}
            onChange={this.handleFilter}
            margin="none"
            variant="filled"
          >
            {MONTHS.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Preloader loading={!loaded}>
          <Paper className={classes.root}>
            <Table padding="checkbox">
              <TableHead>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Причина
                  </TableCell>
                  <TableCell component="th" scope="row">
                    ТВ
                  </TableCell>
                  <TableCell component="th" scope="row">
                    ИНТ
                  </TableCell>
                  <TableCell component="th" scope="row">
                    Кол-во
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {_map(grouped, (v, k) => {
                  return (
                    <TableRow key={k}>
                      <TableCell component="th" scope="row">
                        {k == "null" ? "-" : k}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {v.tv}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {v.int}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {v.total}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Итого:
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {totalSum.tv}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {totalSum.int}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {totalSum.total}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
          <Paper className={classes.root}>
            <Table padding="checkbox">
              <TableHead>
                <TableRow>
                  {rows.map((r) => {
                    return (
                      <TableCell component="th" scope="row" key={r.id}>
                        {r.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {vgroups.map((p, index) => (
                  <TableRow key={index}>
                    {
                      _map(rows, (r) => {
                        let data = p[r.id];
                        switch (r.id) {
                          case 'lk_status':
                            data = this.lk_statuses_hash[p[r.id]]
                            break;
                          case 'bill_delivery':
                            data = this.bill_deliveries_enum[p[r.id]]
                            break;
                        }
                        return (
                          <TableCell component="th" scope="row" key={r.id}>
                            {data}
                            {/* {r.id == 'bill_delivery' ? this.bill_deliveries_enum[p[r.id]] : p[r.id]} */}
                          </TableCell>
                        )
                      })
                    }
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Preloader>
      </Fragment>
    );
  }
}

const styles = (theme) => ({
  root: {
    marginTop: 5,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
});

ConnectionSource.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ConnectionSource);
