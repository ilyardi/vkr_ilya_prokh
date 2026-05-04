import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Rest from "tools/rest";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Paper,
  TablePagination,
  Button,
  IconButton,
  SvgIcon,
  Tooltip,
  TableSortLabel,
} from "@material-ui/core";
import {
  replace as _replace
} from 'lodash';
import dayjs from 'dayjs';
import Preloader from "components/preloader";
import { PageHeader } from '@ant-design/pro-layout';
import { Link } from "react-router-dom";

class EquipmentTypes extends Component {
  state = {
    loading: false,
    equipment_types: [],
    meta: {
      order: "desc",
      orderBy: "created_at",
      page: 1,
      per: 10,
    },
    filter: {
      created_at: [],
    },
    columns: [
      { id: "id", label: "ID" },
      { id: "name", label: "Название" },
      { id: "created_at", label: "Добавлено" },
    ],
  };

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Типы оборудования', '')
  }

  componentDidMount() {
    document.title += ' | Типы оборудования'
    this.loadEquipmentTypes();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.meta.order !== this.state.meta.order ||
      prevState.meta.orderBy !== this.state.meta.orderBy
    ) {
      this.loadEquipmentTypes();
    }
  }

  loadEquipmentTypes = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      order: this.state.meta.order,
      order_by: this.state.meta.orderBy,
      filter: this.state.filter,
    };

    this.setState({ loading: true });
    Rest.get("/api/v1/equipment_types.json", { params: params }).then(
      (response) => {
        const { equipment_types, meta } = response.data;
        this.setState({ equipment_types, meta, loading: false });
      }
    );
  };

  handleChangePage = (e, page) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: page + 1,
      },
    });
  };

  handleChangeRowsPerPage = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        per: parseInt(e.target.value),
        page: 1,
      },
    });
  };

  handleRemoveEquipment = (id) => {
    Rest.delete(`/api/v1/equipment_types/${id}.json`).then((response) => {
      this.loadEquipmentTypes();
    });
  };

  handleRequestSort = (event, orderBy) => {
    let order = "desc";

    if (
      this.state.meta.orderBy === orderBy &&
      this.state.meta.order === "desc"
    ) {
      order = "asc";
    }

    this.setState({ meta: { ...this.state.meta, order, orderBy } });
  };

  renderTableCell = (e, field) => {
    switch (field) {
      case "created_at":
        return dayjs(e[field]).isValid()
          ? dayjs(e[field]).format("YYYY-MM-DD HH:mm:ss")
          : "";
      default:
        return e[field];
    }
  };

  handleRowClick = (e, id) => {
    if (e.target.getAttribute("name") != "delete") {
      this.props.history.push(`/equipment_types/${id}`);
    }
  };

  render() {
    const { columns, equipment_types, meta } = this.state;
    const { classes } = this.props;

    function DeleteIcon(props) {
      return (
        <SvgIcon name="delete" {...props}>
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            name="delete"
          />
        </SvgIcon>
      );
    }

    return (
      <React.Fragment>
        <PageHeader
          title="Тип оборудования"
          extra={[
            <Button key="equipment_types/new">
              <Link to={"/equipment_types/new"}>Добавить тип оборудования</Link>
            </Button>,
          ]}
        />
        <Preloader loading={this.state.loading}>
          <Paper className={classes.paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((c) => {
                    return (
                      <TableCell key={c.id}>
                        <Tooltip
                          title="Sort"
                          placement={"bottom-start"}
                          enterDelay={300}
                        >
                          <TableSortLabel
                            active={meta.orderBy === c.id}
                            direction={meta.order}
                            onClick={(event) =>
                              this.handleRequestSort(event, c.id)
                            }
                          >
                            {c.label}
                          </TableSortLabel>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment_types.map((e) => {
                  return (
                    <TableRow
                      hover
                      key={e.id}
                      onClick={(event) => this.handleRowClick(event, e.id)}
                    >
                      {columns.map((c) => {
                        return (
                          <TableCell key={c.id}>
                            {this.renderTableCell(e, c.id)}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <IconButton
                          size="small"
                          name="delete"
                          onClick={() => {
                            if (window.confirm("Уверены?")) {
                              this.handleRemoveEquipment(e.id);
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {meta.page && (
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      colSpan={9}
                      count={meta.total}
                      rowsPerPage={meta.per}
                      page={meta.page - 1}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </Paper>
        </Preloader>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  paper: {
    width: "100%",
    overflowX: "auto",
    paddingTop: theme.spacing(1.5),
  },
});

export default withStyles(styles)(EquipmentTypes);
