import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Common from "../common/Common";
import {
  WORDS_CREATE_PATH,
  WORDS_DETAIL_PATH,
  TEMPLATES_CREATE_PATH,
  TEMPLATES_DETAIL_PATH,
  MGID_APPLY_CREATE_PATH,
  MGID_DETAIL_PATH,
  DEVELOPMENT_DATA_CREATE_PATH,
  DEVELOPMENT_DATA_DETAIL_PATH,
} from "../common/Path";
import Link from "@material-ui/core/Link";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { Box } from "@material-ui/core/";
import { REVIEW_STATUS_DRAFT } from "../common/ReviewStatusUtils";

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

export interface StatusProps {}

const CreateStatusComponent: React.FC<{
  status: string;
  page: string;
  id: string;
  isEdit: boolean;
}> = ({ status, page, id, isEdit }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aButtonStyles = Common.buttonStyles();
  const statusText =
    status === REVIEW_STATUS_DRAFT
      ? "草稿已保存"
      : page === "MGID_apply"
      ? "申请成功"
      : "提交审核成功";
  const createPathMap: { [key: string]: string } = {
    word: WORDS_CREATE_PATH,
    template: TEMPLATES_CREATE_PATH,
    MGID_apply: MGID_APPLY_CREATE_PATH,
    development_data: DEVELOPMENT_DATA_CREATE_PATH,
  };
  const detailPathMap: { [key: string]: string } = {
    word: WORDS_DETAIL_PATH,
    template: TEMPLATES_DETAIL_PATH,
    MGID_apply: MGID_DETAIL_PATH,
    development_data: DEVELOPMENT_DATA_DETAIL_PATH,
  };
  const createPath = createPathMap[page];
  const detailPath = detailPathMap[page] + "/" + id;

  return (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      marginTop="15%"
    >
      <CheckCircleIcon className={classes.checkCircle} />
      <Typography
        className={fontClasses.WordCreatetitle}
        style={{
          marginTop: "50px",
        }}
      >
        {statusText}
      </Typography>
      <Typography className={classes.textNotice}>
        <span>
          请前往个人数据中心查看或
          <Link className={classes.link} href={detailPath}>
            点击此处查看
          </Link>
        </span>
      </Typography>
      {isEdit ? null : (
        <Button
          className={aButtonStyles.Primary}
          href={createPath}
          style={{
            marginTop: "100px",
          }}
          disableRipple
          disableElevation
          disableFocusRipple
        >
          继续创建
        </Button>
      )}
    </Box>
  );
};

export default CreateStatusComponent;
