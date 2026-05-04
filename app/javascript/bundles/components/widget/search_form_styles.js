export default (theme) => ({
  root: {
    flexGrow: 1,
    width: "auto",
    marginRight: theme.spacing(2),
  },
  title: {
    marginBottom: 10,
  },
  listTitle: {
    backgroundColor: theme.palette.background.paper,
  },
  list: {
    maxHeight: "70vh",
    overflow: "scroll",
  },
});
