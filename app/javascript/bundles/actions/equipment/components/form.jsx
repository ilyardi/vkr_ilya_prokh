import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Select as MaterialSelect,
  MenuItem,
  Button,
  ListSubheader,
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Input,
} from '@material-ui/core';
import { STATUSES } from 'tools/constants';
import { withStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import SearchIcon from '@material-ui/icons/Search';
import UserSearchModal from '../../../components/user_search_modal';

class EquipmentForm extends Component {
  loadOptions = (inputValue, callback) => {
    callback(this.props.lb_agreements);
  };

  render() {
    const {
      classes,
      equipment_types,
      warehouses,
      users,
      identifier,
      model,
      brand,
      serial_number,
      equipment_type_id,
      status,
      location_type,
      location_id,
      errors,
      handleChangeTextField,
      handleSetLocationType,
      handleLocationAgreements,
      handleLocation,
      handleType,
      handleStatus,
      handleSubmit,
      action,
      showAttributes,
      models,
      brands,
      handleChooseBrand,
      handleChooseModel,
      toggleShowSearchUserModal,
      handleCancelShowSearchUserModal,
      isSearchUserModalVisible,
      handleCloseModal,
      lb_agreement_name,
      current_user,
      handleChangeCoords,
      coords,
    } = this.props;

    const validUsers = current_user.role == "engineer" ? users.filter((u) => u.id == current_user.id) : users;
    const isEngineer = current_user.role == "engineer" ? true : false;

    return (
      <form className={classes.root} autoComplete="off">
        <Grid container>
          <Grid item xs={12}>
            <FormControl
              disabled={!showAttributes}
              variant="outlined"
              fullWidth
              size="small"
              error={errors.equipment_type && errors.equipment_type.length > 0}
            >
              <InputLabel>Тип Оборудования</InputLabel>
              <MaterialSelect
                label="Тип Оборудования"
                value={equipment_type_id}
                onChange={handleType}
              >
                {equipment_types.map((t) => {
                  return (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  );
                })}
              </MaterialSelect>
              <FormHelperText>
                {errors.equipment_type && errors.equipment_type.join('. ')}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={brands}
              getOptionLabel={(option) => option}
              onChange={(e, newValue) => {
                handleChooseBrand(newValue);
              }}
              inputValue={brand}
              disabled={!showAttributes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  disabled={!showAttributes}
                  fullWidth
                  size="small"
                  id="brand"
                  name="brand"
                  label="Производитель"
                  variant="outlined"
                  value={brand}
                  onChange={handleChangeTextField}
                  error={errors.brand && errors.brand.length > 0}
                  helperText={errors.brand && errors.brand.join('. ')}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              inputValue={model}
              options={models}
              getOptionLabel={(option) => option}
              disabled={!showAttributes}
              onChange={(e, newValue) => {
                handleChooseModel(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  disabled={!showAttributes}
                  fullWidth
                  size="small"
                  id="model"
                  name="model"
                  label="Модель"
                  variant="outlined"
                  value={model}
                  onChange={handleChangeTextField}
                  error={errors.model && errors.model.length > 0}
                  helperText={errors.model && errors.model.join('. ')}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <TextField
              disabled={!showAttributes}
              fullWidth
              size="small"
              id="serial_number"
              name="serial_number"
              label="Серийный номер"
              variant="outlined"
              value={serial_number}
              onChange={handleChangeTextField}
              error={errors.serial_number && errors.serial_number.length > 0}
              helperText={errors.serial_number && errors.serial_number.join('. ')}
            />
          </Grid>
        </Grid>
        {action == 'update' && (
          <Grid container>
            <Grid item xs={12}>
              <TextField
                disabled
                fullWidth
                size="small"
                id="identifier"
                name="identifier"
                label="Идентификатор"
                variant="outlined"
                value={identifier}
                onChange={handleChangeTextField}
                error={errors.identifier && errors.identifier.length > 0}
                helperText={errors.identifier && errors.identifier.join('. ')}
              />
            </Grid>
          </Grid>
        )}
        <Grid container>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="position"
                name="position"
                value={location_type}
                onChange={handleSetLocationType}
              >
                {/* {current_user_role != "engineer" &&
                  } */}
                <FormControlLabel
                  value="Warehouse"
                  control={<Radio color="primary" />}
                  label="Склад"
                  disabled={isEngineer}
                />
                {action == 'update' && (
                  <React.Fragment>
                    <FormControlLabel
                      value="User"
                      control={<Radio color="primary" />}
                      label="Инженер"
                      disabled={isEngineer && (location_type == 'Warehouse')}
                    />
                    {/* {current_user_role != "main_engineer" &&
                      } */}
                    <FormControlLabel
                      disabled={!isEngineer}
                      value="LbAgreement"
                      control={<Radio color="primary" />}
                      label="Абонент"
                      disabled={isEngineer && (location_type == 'Warehouse')}
                    />
                  </React.Fragment>
                )}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {location_type == 'Warehouse' && (
          <Grid container>
            <Grid item xs={12}>
              <FormControl
                variant="outlined"
                fullWidth
                size="small"
                error={errors.location_id && errors.location_id.length > 0}
                disabled={isEngineer}
              >
                <InputLabel>Локация</InputLabel>
                <MaterialSelect label="Локация" value={location_id} onChange={handleLocation}>
                  {warehouses.map((w) => {
                    return (
                      <MenuItem key={w.id} value={w.id}>
                        {w.name}
                      </MenuItem>
                    );
                  })}
                </MaterialSelect>
                <FormHelperText>
                  {errors.location_id && errors.location_id.join('. ')}
                </FormHelperText>
              </FormControl>
              <FormControl
                style={{ marginTop: '10px', display: "flex", flexDirection: "row" }}
              >
                <TextField
                  // {...params}
                  // disabled={!showAttributes}
                  fullWidth
                  size="small"
                  id="rack"
                  name="rack"
                  label="Стеллаж"
                  variant="outlined"
                  disabled={isEngineer}
                  defaultValue={coords.rack}
                  onChange={handleChangeCoords}
                // error={errors.brand && errors.brand.length > 0}
                // helperText={errors.brand &this.state.equipment.coords& errors.brand.join('. ')}
                />
                <TextField
                  // {...params}
                  // disabled={!showAttributes}
                  fullWidth
                  size="small"
                  id="shelf"
                  name="shelf"
                  label="Полка"
                  variant="outlined"
                  disabled={isEngineer}
                  defaultValue={coords.shelf}
                  onChange={handleChangeCoords}
                // error={errors.brand && errors.brand.length > 0}
                // helperText={errors.brand && errors.brand.join('. ')}
                />
              </FormControl>
            </Grid>
          </Grid>
        )}
        {location_type == 'User' && (
          <Grid container>
            <Grid item xs={12}>
              <FormControl
                variant="outlined"
                fullWidth
                size="small"
                error={errors.location_id && errors.location_id.length > 0}
              >
                <InputLabel>Локация</InputLabel>
                <MaterialSelect label="Локация" value={location_id} onChange={handleLocation}>
                  {validUsers.map((u) => {
                    return (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name}
                      </MenuItem>
                    );
                  })}
                </MaterialSelect>
                <FormHelperText>
                  {errors.location_id && errors.location_id.join('. ')}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        )}
        {location_type == 'LbAgreement' && (
          <Grid container>
            <TextField
              disabled
              fullWidth
              size="small"
              label="Абонент"
              variant="outlined"
              value={lb_agreement_name}
              error={errors.location_id && errors.location_id.length > 0}
              helperText={errors.location_id && errors.location_id.join('. ')}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={toggleShowSearchUserModal} size="small">
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
            <UserSearchModal
              isSearchUserModalVisible={isSearchUserModalVisible}
              handleCancelShowSearchUserModal={handleCancelShowSearchUserModal}
              handleLocationAgreements={handleLocationAgreements}
              handleCloseModal={handleCloseModal}
            />
          </Grid>
        )}
        <Grid container>
          <Grid item xs={12}>
            <FormControl
              variant="outlined"
              fullWidth
              size="small"
              error={errors.status && errors.status.length > 0}
            >
              <InputLabel>Статус</InputLabel>
              <MaterialSelect
                label="Статус"
                value={status}
                onChange={handleStatus}
                disabled={isEngineer && (location_type == 'Warehouse')}
              >
                {location_type == 'Warehouse' && <ListSubheader>Склад</ListSubheader>}
                {location_type == 'Warehouse' &&
                  STATUSES.filter((s) => s.location == 'warehouse').map((s) => {
                    return (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    );
                  })}

                {action == 'update' && location_type == 'User' && (
                  <ListSubheader>Инженер</ListSubheader>
                )}
                {action == 'update' &&
                  location_type == 'User' &&
                  STATUSES.filter((s) => s.location == 'user').map((s) => {
                    return (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    );
                  })}

                {action == 'update' && location_type == 'LbAgreement' && (
                  <ListSubheader>Абонент</ListSubheader>
                )}
                {action == 'update' &&
                  location_type == 'LbAgreement' &&
                  STATUSES.filter((s) => s.location == 'lb_agreement').map((s) => {
                    return (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    );
                  })}
              </MaterialSelect>
              <FormHelperText>{errors.status && errors.status.join('. ')}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" size="small" onClick={handleSubmit}>
              {action == 'create' ? 'Добавить' : 'Обновить'}
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

const styles = (theme) => ({
  root: {
    '& > *': {
      // width: '100%',
      marginTop: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      // marginBottom: theme.spacing(1),
    },
  },
  formControl: {
    minWidth: 180,
  },
  address: {
    marginBottom: theme.spacing(1),
  },
});

const mapStateToProps = (state) => {
  return {
    current_user: state.user,
  };
};

export default connect(
  mapStateToProps,
  null,
)(withStyles(styles)(EquipmentForm));