// import React, { Component, Fragment } from 'react';
// import { isEqual as _isEqual, groupBy as _groupBy, keys as _keys } from 'lodash';
// import PropTypes from 'prop-types';
// import { withStyles } from '@material-ui/core/styles';
// import dayjs from 'dayjs';
// import {
//   Table, TableHead, TableRow, TableCell, TableBody,
//   Paper, Typography
// } from '@material-ui/core';

// // import CallRow from 'components/calls/row';
// import Rest from 'tools/rest';

// class Reasons extends Component {
//   state = {
//     call_reasons: [],
//   }

//   componentDidMount() {
//     this.load();
//   }

//   // handleChangePage = (e, page) => {
//   //   this.load(page + 1);
//   // }

//   // handleChangeRowsPerPage = e => {
//   //   this.load(this.state.meta.page, e.target.value);
//   // }

//   // handleFilter = name => event => {
//   //   this.setState({
//   //     filter: {
//   //       ...this.state.filter,
//   //       [name]: event.target.value
//   //     },
//   //   });
//   // }

//   load = () => {
//     Rest.get('/api/v1/call_reasons.json', { params: {} })
//       .then(response => {
//         this.setState(response.data);
//       });
//   }

//   componentDidUpdate = (prevProps, prevState) => {
//     if (!_isEqual(prevState.filter, this.state.filter)) {
//       this.load();
//     }
//   }

//   render() {
//     const { classes } = this.props;

//     const { call_reasons } = this.state;

//     return (
//       <Fragment>
//         <Typography variant="h4" gutterBottom component="h1">Отчет по звонкам</Typography>
//         <div className={classes.tableContainer}>
//           <Paper>
//             <Table className={classes.table} padding="checkbox">
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Причина</TableCell>
//                   {this.state.months.map((m) => {
//                     return (<TableCell key={m}>{dayjs.unix(m).format('MMMM YYYY')}</TableCell>);
//                   })}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {reasons.map((r, idx) => {
//                   return (
//                     <TableRow key={idx}>
//                       <TableCell>{r}</TableCell>
//                       {this.state.months.map((m, midx) => {
//                         return (
//                           <TableCell key={midx}>{this.state.report[r][m + '']}</TableCell>
//                         );
//                       })}
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </Paper>
//         </div>
//       </Fragment>
//     );
//   }
// }

// Reasons.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

// const styles = theme => ({

// });

// export default withStyles(styles)(Reasons);
