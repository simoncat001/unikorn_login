import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Common from "../common/Common";
import { DEVELOPMENT_DATA_DETAIL_PUBLIC_PATH } from "../common/Path";
import Link from "@material-ui/core/Link";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { Box } from "@material-ui/core/";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textNotice: {
      fontSize: "16px",
      lineHeight: "20px",
      textAlign: "center",
      color: aColor.lightBodyText,
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: "25px",
    },
    link: {
      fontSize: "16px",
      color: aColor.primaryColor,
    },
    checkCircle: {
      color: aColor.lightFill,
      fontSize: "67px",
    },
  })
);

const MGIDInternalDataComponent: React.FC<{
  id: string;
}> = ({ id }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <ErrorOutlineIcon className={classes.checkCircle} />
      <Typography
        className={fontClasses.WordCreatetitle}
        style={{
          marginTop: "50px",
        }}
      >
        数据MGID暂不支持查看详情
      </Typography>
      <Typography className={classes.textNotice}>
        <Link
          className={classes.link}
          href={DEVELOPMENT_DATA_DETAIL_PUBLIC_PATH + "/" + id}
        >
          点击此处查看关联数据
        </Link>
      </Typography>
    </Box>
  );
};

export default MGIDInternalDataComponent;
