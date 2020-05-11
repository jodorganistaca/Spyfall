import { connect } from "react-redux";
import TopBarProgress from "react-topbar-progress-indicator";
import theme from "../styles/theme";

TopBarProgress.config({
  barColors: {
    "0": theme.palette.success.dark,
    "1.0": theme.palette.success.light,
  },
  shadowBlur: 5,
});

const LoadingBar = ({ active }) => {
  return <>{active && <TopBarProgress />}</>;
};

const mapStateToProps = (state) => ({ active: state.app.progressBarActive });

export default connect(mapStateToProps, () => ({}))(LoadingBar);
