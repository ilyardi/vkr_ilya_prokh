import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Rest from 'tools/rest';
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
  FormControl,
  TableSortLabel,
  MenuItem,
  Grid,
  InputLabel,
  Select,
  OutlinedInput,
  TextField,
  ListSubheader,
} from '@material-ui/core';
import dayjs from 'dayjs';
import Preloader from 'components/preloader';
import { PageHeader } from '@ant-design/pro-layout';
import { STATUSES_LABELS, STATUSES } from 'tools/constants';
import { Link } from 'react-router-dom';
import { debounce, replace as _replace } from 'lodash';
import UserSearchModal from '../../components/user_search_modal';
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';

class Equipment extends Component {
  state = {
    loading: false,
    useDebounce: false,
    equipment: [],
    meta: {
      order: 'desc',
      orderBy: 'created_at',
      page: 1,
      per: 10,
    },
    filter: {
      created_at: [],
    },
    columns: [
      { id: 'identifier', label: 'Идентификатор' },
      { id: 'equipment_type', label: 'Тип' },
      { id: 'brand', label: 'Производитель' },
      { id: 'model', label: 'Модель' },
      { id: 'serial_number', label: 'Серийный номер' },
      { id: 'location', label: 'Склад' },
      { id: 'coords', label: 'Размещение' },
      { id: 'status', label: 'Статус' },
      { id: 'created_at', label: 'Добавлено' },
    ],
    search: {},
    equipment_types: [],
    brands: [],
    models: [],
    warehouses: [],
    users: [],
    isSearchUserModalVisible: false,
    lb_agreement_name: '',
  };

  componentWillUnmount() {
    document.title = _replace(document.title, ' | Оборудование', '')
  }

  componentDidMount() {
    document.title += ' | Оборудование'
    this.loadEquipment();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.meta.order !== this.state.meta.order ||
      prevState.meta.orderBy !== this.state.meta.orderBy ||
      prevState.search.status !== this.state.search.status ||
      prevState.search.equipment_type !== this.state.search.equipment_type ||
      prevState.search.brand !== this.state.search.brand ||
      prevState.search.model !== this.state.search.model ||
      prevState.search.warehouse !== this.state.search.warehouse ||
      prevState.search.lb_agreement !== this.state.search.lb_agreement
    ) {
      this.loadEquipment();
    }

    if (
      prevState.search.identifier !== this.state.search.identifier ||
      prevState.search.serial_number !== this.state.search.serial_number
    ) {
      if (this.debounceLoad) {
        this.debounceLoad.cancel();
      }
      this.debounceLoad = debounce(() => {
        this.loadEquipment();
      }, 500);

      this.debounceLoad();

      if (!this.state.useDebounce) {
        this.debounceLoad.flush();
      }
    }
  }

  loadEquipment = () => {
    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      order: this.state.meta.order,
      order_by: this.state.meta.orderBy,
      filter: this.state.filter,
      search: {
        status: STATUSES_LABELS[this.state.search.status],
        identifier: this.state.search.identifier,
        serial_number: this.state.search.serial_number,
        equipment_type: this.state.search.equipment_type,
        brand: this.state.search.brand,
        model: this.state.search.model,
        warehouse: this.state.search.warehouse,
        lb_agreement: this.state.search.lb_agreement,
      },
    };

    this.setState({ loading: true, useDebounce: false });
    Rest.get('/api/v1/equipment.json', { params: params }).then((response) => {
      const { equipment, meta, equipment_types, brands, models, warehouses, users } = response.data;
      this.setState({
        equipment,
        meta,
        equipment_types,
        brands,
        models,
        warehouses,
        users,
        loading: false,
      });
    });
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

  handleChangeStatus = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: 1,
      },
      search: {
        ...this.state.search,
        status: e.target.value,
      },
    });
  };

  handleChangeEquipmentType = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: 1,
      },
      search: {
        ...this.state.search,
        equipment_type: e.target.value,
      },
    });
  };

  handleChangeModel = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: 1,
      },
      search: {
        ...this.state.search,
        model: e.target.value,
      },
    });
  };

  handleChangeBrand = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: 1,
      },
      search: {
        ...this.state.search,
        brand: e.target.value,
      },
    });
  };

  handleChangeWarehouse = (e) => {
    this.setState({
      meta: {
        ...this.state.meta,
        page: 1,
      },
      search: {
        ...this.state.search,
        warehouse: e.target.value,
      },
    });
  };

  handleRemoveEquipment = (id) => {
    Rest.delete(`/api/v1/equipment/${id}.json`).then((response) => {
      this.loadEquipment();
    });
  };

  handleRequestSort = (event, orderBy) => {
    let order = 'desc';

    if (this.state.meta.orderBy === orderBy && this.state.meta.order === 'desc') {
      order = 'asc';
    }

    this.setState({ meta: { ...this.state.meta, order, orderBy } });
  };

  renderTableCell = (e, field) => {
    switch (field) {
      case 'status':
        return STATUSES_LABELS[e[field]];
      case 'created_at':
        return dayjs(e[field]).isValid() ? dayjs(e[field]).format('YYYY-MM-DD HH:mm:ss') : '';
      case 'coords':
        const coords = e.coords.rack && e.coords.shelf ? `Стеллаж: ${e.coords.rack} / Полка: ${e.coords.shelf}` : 'не размещен'
        return coords
      default:
        return e[field];
    }
  };

  handleRowClick = (e, id) => {
    if (e.target.getAttribute('name') != 'delete') {
      this.props.history.push(`/equipment/${id}`);
    }
  };

  handleChangeText = () => {
    return (e) => {
      this.setState({
        useDebounce: true,
        meta: { ...this.state.meta, page: 1 },
        search: { ...this.state.search, [e.target.name]: e.target.value },
      });
    };
  };

  toggleShowSearchUserModal = () => {
    this.setState({ isSearchUserModalVisible: !this.state.isSearchUserModalVisible });
  };

  handleCloseModal = () => {
    this.setState({ isSearchUserModalVisible: false });
  };

  handleCancelShowSearchUserModal = () => {
    this.setState({ isSearchUserModalVisible: false });
  };

  handleCloseModal = () => {
    this.setState({ isSearchUserModalVisible: false });
  };

  handleLocationAgreements = (v) => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, lb_agreement: v.id },
      lb_agreement_name: v.name,
    });
  };

  handleClearLbAgreement = () => {
    this.setState({
      meta: { ...this.state.meta, page: 1 },
      search: { ...this.state.search, lb_agreement: undefined },
      lb_agreement_name: '',
    });
  };

  render() {
    const {
      columns,
      equipment,
      meta,
      search,
      equipment_types,
      models,
      brands,
      warehouses,
      users,
      isSearchUserModalVisible,
      lb_agreement_name,
    } = this.state;
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
          title="Склад"
          extra={[
            <Button key="equipment/new">
              <Link to={'/equipment/new'}>Добавить оборудование</Link>
            </Button>,
          ]}
        />
        <Preloader loading={this.state.loading}>
          <Paper className={classes.filters}>
            <Grid container alignItems="center" justify="space-between">
              <Grid item>
                <Grid container>
                  <Grid item className={classes.searchContainer}>
                    <TextField
                      className={classes.searchFormControl}
                      label="Идентификатор"
                      name="identifier"
                      value={search.identifier}
                      margin="dense"
                      variant="outlined"
                      onChange={this.handleChangeText('identifier')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      className={classes.searchFormControl}
                      label="Серийный номер"
                      name="serial_number"
                      value={search.serial_number}
                      margin="dense"
                      variant="outlined"
                      onChange={this.handleChangeText('serial_number')}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <FormControl variant="outlined" className={classes.searchFormControl}>
                      <InputLabel shrink htmlFor="search-warehouse">
                        Склад
                      </InputLabel>
                      <Select
                        defaultValue=""
                        id="search-warehouse"
                        name="warehouse"
                        displayEmpty
                        labelId="search-warehouse"
                        value={search.warehouse}
                        margin="dense"
                        onChange={this.handleChangeWarehouse}
                        input={<OutlinedInput notched labelWidth={50} />}
                      >
                        <MenuItem value={''}>Все</MenuItem>
                        <ListSubheader>Склады</ListSubheader>
                        {warehouses.map((w) => {
                          return (
                            <MenuItem key={w.id} value={w.name}>
                              {w.name}
                            </MenuItem>
                          );
                        })}
                        <ListSubheader>Инженеры</ListSubheader>
                        {users.map((u) => {
                          return (
                            <MenuItem key={u.id} value={u.name}>
                              {u.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={classes.searchFormControl}>
                      <InputLabel shrink>Статус</InputLabel>
                      <Select
                        name="status"
                        displayEmpty
                        labelId="search-status"
                        value={search.status}
                        margin="dense"
                        onChange={this.handleChangeStatus}
                        input={<OutlinedInput notched labelWidth={50} />}
                      >
                        <MenuItem value={undefined}>Все</MenuItem>
                        {STATUSES.map((s) => {
                          return (
                            <MenuItem key={s.label} value={s.value}>
                              {s.label}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={classes.searchFormControl}>
                      <InputLabel shrink>Тип</InputLabel>
                      <Select
                        name="equipment_type"
                        displayEmpty
                        labelId="search-equipment_type"
                        value={search.equipment_type}
                        margin="dense"
                        onChange={this.handleChangeEquipmentType}
                        input={<OutlinedInput notched labelWidth={35} />}
                      >
                        <MenuItem value={undefined}>Все</MenuItem>
                        {equipment_types.map((t) => {
                          return (
                            <MenuItem key={t.name} value={t.name}>
                              {t.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={classes.searchFormControl}>
                      <InputLabel shrink>Модель</InputLabel>
                      <Select
                        name="model"
                        displayEmpty
                        labelId="search-model"
                        value={search.model}
                        margin="dense"
                        onChange={this.handleChangeModel}
                        input={<OutlinedInput notched labelWidth={65} />}
                      >
                        <MenuItem value={undefined}>Все</MenuItem>
                        {models.map((m) => {
                          return (
                            <MenuItem key={m} value={m}>
                              {m}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={classes.searchFormControl}>
                      <InputLabel shrink>Производитель</InputLabel>
                      <Select
                        name="brand"
                        displayEmpty
                        labelId="search-model"
                        value={search.brand}
                        margin="dense"
                        onChange={this.handleChangeBrand}
                        input={<OutlinedInput notched labelWidth={120} />}
                      >
                        <MenuItem value={undefined}>Все</MenuItem>
                        {brands.map((m) => {
                          return (
                            <MenuItem key={m} value={m}>
                              {m}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" className={classes.searchFormControl}>
                      <TextField
                        disabled
                        fullWidth
                        size="small"
                        label="Абонент"
                        variant="outlined"
                        value={lb_agreement_name}
                        InputProps={{
                          endAdornment: (
                            <React.Fragment>
                              <IconButton onClick={this.toggleShowSearchUserModal} size="small">
                                <SearchIcon />
                              </IconButton>
                              <IconButton onClick={this.handleClearLbAgreement} size="small">
                                <CancelIcon />
                              </IconButton>
                            </React.Fragment>
                          ),
                        }}
                      />
                      <UserSearchModal
                        isSearchUserModalVisible={isSearchUserModalVisible}
                        handleCancelShowSearchUserModal={this.handleCancelShowSearchUserModal}
                        handleLocationAgreements={this.handleLocationAgreements}
                        handleCloseModal={this.handleCloseModal}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Paper className={classes.paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((c) => {
                    return (
                      <TableCell key={c.id}>
                        {['location', 'status', 'equipment_type', 'coords'].includes(c.id) ? (
                          c.label
                        ) : (
                          <Tooltip title="Sort" placement={'bottom-start'} enterDelay={300}>
                            <TableSortLabel
                              active={meta.orderBy === c.id}
                              direction={meta.order}
                              onClick={(event) => this.handleRequestSort(event, c.id)}
                            >
                              {c.label}
                            </TableSortLabel>
                          </Tooltip>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((e) => {
                  return (
                    <TableRow
                      hover
                      key={e.id}
                      onClick={(event) => this.handleRowClick(event, e.id)}
                    >
                      {columns.map((c) => {
                        return <TableCell key={c.id}>{this.renderTableCell(e, c.id)}</TableCell>;
                      })}
                      <TableCell>
                        <IconButton
                          size="small"
                          name="delete"
                          onClick={() => {
                            if (window.confirm('Уверены?')) {
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
    width: '100%',
    overflowX: 'auto',
    paddingTop: theme.spacing(1.5),
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
  },
  filters: {
    width: '100%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
  },
  searchFormControl: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(0.5),
    minWidth: 250,
  },
});

export default withStyles(styles)(Equipment);
