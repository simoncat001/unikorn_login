import Common from "../common/Common";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AddRoundedIcon from "@material-ui/icons/AddRounded";
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
  })
);
const Test: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const buttonClasses = Common.buttonStyles();
  const disable = false;
  return (
    <div className={classes.root}>
      <CssBaseline />
      <div>
        <Button
          disabled={disable}
          className={
            disable
              ? buttonClasses.SecondarySmall
              : buttonClasses.SecondarySmallDisabled
          }
        >
          按钮
        </Button>
        <Button className={buttonClasses.SecondaryIconHover} endIcon="">
          点击上传
        </Button>
        <Button className={buttonClasses.Secondary} size="small">
          按钮
        </Button>
      </div>
    </div>
  );
};
export default Test;
