import React, { Component } from 'react';
import {
  Paper,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Tooltip,
  TableSortLabel,
  TablePagination,
  TextField,
} from '@material-ui/core';
import Rest from 'tools/rest';
import Preloader from 'components/preloader';
import { withStyles } from '@material-ui/core/styles';
import EquipmentForm from './components/form';
import { STATUSES_LABELS, LOCATION_TYPES } from 'tools/constants';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class EquipmentUpdate extends Component {
  state = {
    equipment: {
      identifier: '',
      model: '',
      brand: '',
      serial_number: '',
      location_id: '',
      location_type: '',
      coords: {
        rack: null,
        shelf: null,
      },
      equipment_type_id: '',
      status: '',
    },
    meta: {
      order: 'desc',
      orderBy: 'created_at',
      page: 1,
      per: 10,
      total: 0,
    },
    loading: false,
    warehouses: [],
    users: [],
    lb_agreements: [],
    equipment_types: [],
    equipment_locations: [],
    errors: {},
    search: '',
    columns: [
      { id: 'location_type', label: 'Тип' },
      { id: 'name', label: 'Имя' },
      { id: 'status', label: 'Статус' },
      { id: 'changed_by', label: 'Изменено' },
      { id: 'created_at', label: 'Время' },
    ],
    street: '',
    building: undefined,
    flat: undefined,
    streetOptions: [],
    buildingOptions: [],
    flatOptions: [],
    brands: [],
    models: [],
    isSearchUserModalVisible: false,
    lb_agreement_name: '',
  };

  componentDidMount() {
    this.loadEquipment();
    this.loadWarehouses();
    this.loadUsers();
    this.loadEquipmentTypes();
    this.loadEquipmentLocations();
    this.loadEquipmentBrandsAndModels();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevState.meta.page !== this.state.meta.page ||
      prevState.meta.per !== this.state.meta.per ||
      prevState.meta.order !== this.state.meta.order ||
      prevState.meta.orderBy !== this.state.meta.orderBy
    ) {
      this.loadEquipmentLocations();
    }
  };

  loadEquipmentBrandsAndModels = () => {
    this.setState({ loading: true });
    Rest.get('/api/v1/equipment/brands.json').then((response) => {
      const { brands, models } = response.data;
      this.setState({ brands, models, loading: false });
    });
  };

  loadBuildingOptions = () => {
    this.setState({ loading: true });
    const { street } = this.state;

    Rest.get(`/api/v1/addresses/houses.json?street=${street.value}`)
      .then((res) => {
        const { data } = res;
        const { suggestions } = data;
        const options = suggestions.map((s) => {
          return { id: s.id, value: s.value, label: s.value };
        });
        this.setState({
          buildingOptions: options,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({ loading: false });
      });
  };

  handleSubmit = () => {
    const id = this.props.match.params.id;

    // if (this.state.equipment.location_type != 'warehouse') {
    //   this.setState({
    //     equipment: { ...this.state.equipment, coords: { rack: null, shelf: null } }
    //   })
    // }

    const { errors } = this.state;
    let { equipment } = this.state;
    if (equipment.location_type != 'Warehouse') {
      equipment.coords = { rack: null, shelf: null }
    }

    this.setState({ loading: true, errors: {} });

    Rest.put(`/api/v1/equipment/${id}.json`, {
      equipment: equipment,
    })
      .then((response) => {
        const { equipment } = response.data;
        this.setState({ equipment });
        this.setState({ loading: false });
        this.notify();
        this.loadEquipmentLocations();
      })
      .catch((e) => {
        const { data } = e.response;
        const { errors } = data;
        this.setState({ errors: errors, loading: false });
      });
  };

  handleChangeCoords = (e) => {
    this.setState({
      equipment: { ...this.state.equipment, coords: { ...this.state.equipment.coords, [e.target.name]: e.target.value } },
      // errors: { ...e.state.errors, [e.target.name]: null },
    })
  };

  loadEquipment = () => {
    const id = this.props.match.params.id;
    this.setState({ loading: true });

    Rest.get(`/api/v1/equipment/${id}.json`).then((response) => {
      const { equipment } = response.data;
      this.setState({
        equipment,
        lb_agreement_name: equipment.location_type == 'LbAgreement' ? equipment.location_name : '',
        loading: false,
      });
    });
  };

  loadWarehouses = () => {
    this.setState({ loading: true });

    Rest.get('/api/v1/warehouses.json').then((response) => {
      const { warehouses } = response.data;
      this.setState({ warehouses, loading: false });
    });
  };

  loadUsers = () => {
    this.setState({ loading: true });

    Rest.get('/api/v1/users/warehouse_users.json').then((response) => {
      const { users } = response.data;
      this.setState({ users, loading: false });
    });
  };

  loadEquipmentTypes = () => {
    this.setState({ loading: true });

    Rest.get('/api/v1/equipment_types.json').then((response) => {
      const { equipment_types } = response.data;
      this.setState({ equipment_types, loading: false });
    });
  };

  loadEquipmentLocations = () => {
    const id = this.props.match.params.id;

    const params = {
      page: this.state.meta.page,
      per: this.state.meta.per,
      order: this.state.meta.order,
      order_by: this.state.meta.orderBy,
    };

    this.setState({ loading: true });

    Rest.get(`/api/v1/equipment_locations.json?equipment_id=${id}`, {
      params: params,
    }).then((response) => {
      const { equipment_locations, meta } = response.data;
      this.setState({ equipment_locations, meta, loading: false });
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

  handleChangeTextField = (e) => {
    this.setState({
      equipment: { ...this.state.equipment, [e.target.name]: e.target.value },
      errors: { ...this.state.errors, [e.target.name]: null },
    });
  };

  handleType = (e) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        equipment_type_id: e.target.value,
      },
      errors: { ...this.state.errors, equipment_type: null },
    });
  };

  handleLocation = (e) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        location_id: e.target.value,
      },
      errors: { ...this.state.errors, location_id: null },
    });
  };

  handleStatus = (e) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        status: e.target.value,
      },
      errors: { ...this.state.errors, status: null },
    });
  };

  handleSetLocationType = (e) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        location_type: e.target.value,
      },
    });
  };

  handleLocationAgreements = (v) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        location_id: v.id,
      },
      lb_agreement_name: v.name,
      errors: { ...this.state.errors, location: null },
    });
  };

  handleLbAgrementsInputChange = (v) => {
    this.setState({
      search: v,
    });
  };

  handleRequestSort = (event, orderBy) => {
    let order = 'desc';

    if (this.state.meta.orderBy === orderBy && this.state.meta.order === 'desc') {
      order = 'asc';
    }

    this.setState({ meta: { ...this.state.meta, order, orderBy } });
  };

  handleChangeStreet = (street) => {
    this.setState({ street });
  };

  handleChangeBuilding = (building) => {
    this.setState({ building });
  };

  handleChangeFlat = (flat) => {
    this.setState({ flat });
  };

  renderTableCell = (e, field) => {
    switch (field) {
      case 'location_type':
        return LOCATION_TYPES[e[field]];
      case 'status':
        return STATUSES_LABELS[e[field]];
      case 'created_at':
        return dayjs(e[field]).isValid() ? dayjs(e[field]).format('YYYY-MM-DD HH:mm:ss') : '';
      default:
        return e[field];
    }
  };

  handleChooseModel = (v) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        model: v,
      },
    });
  };

  handleChooseBrand = (v) => {
    this.setState({
      equipment: {
        ...this.state.equipment,
        brand: v,
      },
    });
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

  notify = () => toast.success('Обновлено');

  render() {
    const { classes } = this.props;
    const {
      loading,
      equipment_types,
      warehouses,
      users,
      lb_agreements,
      errors,
      equipment,
      search,
      equipment_locations,
      columns,
      meta,
      street,
      building,
      flat,
      streetOptions,
      buildingOptions,
      flatOptions,
      models,
      brands,
      isSearchUserModalVisible,
      lb_agreement_name,
    } = this.state;

    return (
      <Preloader loading={loading}>
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
        />
        <Grid container spacing={2}>
          <Grid item lg={5} xs={12}>
            <Paper className={classes.pageContent}>
              <EquipmentForm
                equipment_types={equipment_types}
                warehouses={warehouses}
                users={users}
                lb_agreements={lb_agreements}
                identifier={equipment.identifier}
                model={equipment.model}
                brand={equipment.brand}
                serial_number={equipment.serial_number}
                equipment_type_id={equipment.equipment_type_id}
                status={equipment.status}
                location_type={equipment.location_type}
                location_id={equipment.location_id}
                location_name={equipment.location_name}
                errors={errors}
                handleChangeTextField={this.handleChangeTextField}
                handleSetLocationType={this.handleSetLocationType}
                handleLocationAgreements={this.handleLocationAgreements}
                handleLocation={this.handleLocation}
                handleType={this.handleType}
                handleStatus={this.handleStatus}
                handleSubmit={this.handleSubmit}
                handleLbAgrementsInputChange={this.handleLbAgrementsInputChange}
                action={'update'}
                search={search}
                showAttributes={equipment_locations.length < 2}
                street={street}
                building={building}
                flat={flat}
                streetOptions={streetOptions}
                buildingOptions={buildingOptions}
                flatOptions={flatOptions}
                handleChangeStreet={this.handleChangeStreet}
                handleChangeBuilding={this.handleChangeBuilding}
                handleChangeFlat={this.handleChangeFlat}
                models={models}
                brands={brands}
                handleChooseModel={this.handleChooseModel}
                handleChooseBrand={this.handleChooseBrand}
                toggleShowSearchUserModal={this.toggleShowSearchUserModal}
                handleCancelShowSearchUserModal={this.handleCancelShowSearchUserModal}
                isSearchUserModalVisible={isSearchUserModalVisible}
                handleCloseModal={this.handleCloseModal}
                lb_agreement_name={lb_agreement_name}
                handleChangeCoords={this.handleChangeCoords}
                coords={equipment.coords}
              />
            </Paper>
          </Grid>
          <Grid item lg={7} xs={12}>
            <Grid container>
              <Grid item lg={12} xs={12}>
                <Paper className={classes.pageContent}>
                  <TextField
                    fullWidth
                    size="small"
                    id="comment"
                    name="comment"
                    label="Комментарий"
                    variant="outlined"
                    className={classes.field}
                    value={equipment.comment}
                    multiline={true}
                    onChange={this.handleChangeTextField}
                    error={errors.comment && errors.comment.length > 0}
                    helperText={errors.comment && errors.comment.join('. ')}
                  />
                </Paper>
              </Grid>
              <Grid item lg={12} xs={12}>
                <Paper className={classes.pageContent}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {columns.map((c) => {
                          return (
                            <TableCell key={c.id}>
                              {['name'].includes(c.id) ? (
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {equipment_locations.map((e) => {
                        return (
                          <TableRow hover key={e.id}>
                            {columns.map((c) => {
                              return (
                                <TableCell key={c.id}>{this.renderTableCell(e, c.id)}</TableCell>
                              );
                            })}
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
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Preloader>
    );
  }
}

const styles = (theme) => ({
  pageContent: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
  field: {},
});

export default withStyles(styles)(EquipmentUpdate);
