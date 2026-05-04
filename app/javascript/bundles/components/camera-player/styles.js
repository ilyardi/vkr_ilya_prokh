const styles = theme => ({
  iframeWrapper: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
  iframe: {
    position: "absolute",
    background: "#000",
    border: "none",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    borderRadius: "1.25vw",
  },
  closeModal: {
    backgroundColor: "transparent",
    zIndex: 10,
    position: "absolute",
    right: 0,
    top: '20px',
    // padding: "20px",
    border: 0,
    borderRadius: "1.25vw",
  },
  closeIcon: {
    width: "20px",
  },
  closeText: {
    fontFamily: "Gilroy-Light, sans-serif;",
    color: "rgba(255,255,255,0.8)",
    padding: "10px",
  },
});

export default styles;
