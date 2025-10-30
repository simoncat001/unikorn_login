import Common from "../../common/Common";
import { Box, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() =>
  createStyles({
    leftTitle: {
      width: "76px",
      maxWidth: "76px",
      float: "left",
    },
    leftValue: {
      width: "160px",
      maxWidth: "160px",
      float: "left",
    },
    rightTitle: {
      width: "113px",
      minWidth: "113px",
      float: "left",
    },
    rightValue: {
      width: "240px",
      float: "left",
      maxWidth: "240px",
    },
  })
);

const DetailDataItem: React.FC<{
  label: string;
  content: string;
  isLeft?: boolean;
  icon?: JSX.Element;
}> = ({ label, content, isLeft = true, icon }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" m={1}>
      <Box className={isLeft ? classes.leftTitle : classes.rightTitle}>
        <Typography className={fontClasses.boldFont}>{label}：</Typography>
      </Box>
      <Box className={isLeft ? classes.leftValue : classes.rightValue}>
        <Typography
          className={fontClasses.unboldFont}
          style={{ float: "left", wordBreak: "break-all" }}
        >
          {content}
        </Typography>
        {icon}
      </Box>
    </Box>
  );
};

export default DetailDataItem;
