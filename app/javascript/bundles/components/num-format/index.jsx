import React, { Component } from "react";
import NumberFormat from "react-number-format";

class NumFormat extends Component {
  render() {
    return (
      <NumberFormat
        thousandSeparator={" "}
        decimalScale={2}
        displayType={"text"}
        prefix={""}
        {...this.props}
      />
    );
  }
}

export default NumFormat;
