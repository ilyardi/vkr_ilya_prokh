import React, { Component } from "react";
import { Grid, TextField, Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

class EquipmentTypeForm extends Component {
  loadOptions = (inputValue, callback) => {
    callback(this.props.lb_agreements);
  };

  render() {
    const {
      classes,
      name,
      errors,
      handleChangeTextField,
      handleSubmit,
      action,
    } = this.props;

    return (
      <form className={classes.root} autoComplete="off">
        <Grid container>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              id="name"
              name="name"
              label="Название"
              variant="outlined"
              value={name}
              onChange={handleChangeTextField}
              error={errors.name && errors.name.length > 0}
              helperText={errors.name && errors.name.join(". ")}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSubmit}
            >
              {action == "create" ? "Добавить" : "Обновить"}
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

const styles = (theme) => ({
  root: {
    "& > *": {
      width: "80%",
      margin: theme.spacing(1),
    },
  },
  formControl: {
    minWidth: 180,
  },
});

export default withStyles(styles)(EquipmentTypeForm);
