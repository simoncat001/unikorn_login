import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import {
  Button,
  Divider,
  Popover,
  Radio,
  TextField,
  Typography,
} from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import Map from "../../common/Map";
import Common from "../../common/Common";
import exportUtils from "../../common/Utils";
import {
  AdminItemDisplayProps,
  AdminBreadcrumbsProps,
  AdminDividerProps,
  AdminSnackbarProps,
  AdminReviewRadioProps,
  AdminReviewInputProps,
  AdminCreatorInfoProps,
  reviewList,
} from "./AdminPageUtil";
import { useState } from "react";
import Icons from "../Icon";
import React from "react";
import ReviewStatusUtil from "../../common/ReviewStatusUtils";
import { templateJSON } from "../../api/TemplateService";
import { WordJSON } from "../../api/WordService";
import { DevelopmentDataJSON } from "../../api/DevelopmentDataService";
import UserService from "../../api/UserService";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) => ({
  titleControl: {
    height: "60px",
    maxHeight: "60px",
    marginLeft: "50px",
  },
  creatorInfoControl: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginRight: "94px",
  },
  itemControl: {
    minHeight: "35px",
  },
  dividerControl: {
    height: "1px",
    marginTop: "10px",
    marginLeft: "0px",
  },
  delTypo: {
    color: aColor.primaryColor,
    "&:hover": {
      background: "transparent",
      color: aColor.seoncdaryBodyText,
      cursor: "pointer",
    },
  },
  radioControl: {
    height: "30px",
    width: "30px",
  },
  textControl: {
    width: "594px",
    height: "97px",
  },
}));

export const AdminItemDisplay: React.FC<AdminItemDisplayProps> = ({
  type,
  value,
  jsonData,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const whichValue = (m: string) => {
    switch (m) {
      case "word":
        return Map.wordItemMap[value];
      case "template":
        return Map.templateItemMap[value];
      case "data":
        return Map.developmentDataItemMap[value];
      default:
        return "";
    }
  };

  const itemValue = (m: string) => {
    switch (m) {
      case "word":
        const wordElemValue = exportUtils.getWordElemValue(
          jsonData as WordJSON,
          value
        );
        if (value === "data_type") {
          return Map.dataTypeMap[wordElemValue];
        }
        return wordElemValue;
      case "template":
        const templateELemValue = exportUtils.getTemplateElemValue(
          jsonData as templateJSON,
          value
        );
        if (value === "data_generate_method") {
          return Map.dataGenerateMethodMap[templateELemValue];
        } else if (value === "template_type") {
          return Map.templateTypeMap[templateELemValue];
        }
        return templateELemValue;
      case "data":
        const dataElemValue = exportUtils.getDataElemValue(
          jsonData as DevelopmentDataJSON,
          value
        );
        if (value === "data_generate_method") {
          return Map.dataGenerateMethodMap[dataElemValue];
        } else if (value === "template_type") {
          return Map.templateTypeMap[dataElemValue];
        }
        return dataElemValue;
      default:
        return "";
    }
  };

  const listValue = () => {
    const options = (jsonData as WordJSON).options;
    if (options === undefined) {
      return null;
    }
    return options.map((option, index) => (
      <Box key={"option" + index}>
        <Typography className={fontClasses.unboldFont}>
          {index + 1}. {option}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box display="flex" flexDirection="row" className={classes.itemControl}>
      <Box display="flex" flexBasis="120px" minWidth="120px">
        <div className={fontClasses.CardDisplayItem}>{whichValue(type)}</div>
      </Box>
      <Box display="flex" flexGrow={1}>
        <div
          className={fontClasses.unboldFont}
          style={{ wordBreak: "break-all" }}
        >
          {value === "review_status"
            ? ReviewStatusUtil.reviewStatusMap[itemValue(type)]
            : value === "options"
            ? listValue()
            : itemValue(type)}
        </div>
      </Box>
    </Box>
  );
};

export const AdminTitle: React.FC<AdminBreadcrumbsProps> = ({
  type,
  serial_number = "",
  chinese_name,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      className={classes.titleControl}
      width="377px"
    >
      <Box display="flex" flexWrap="wrap">
        <div
          className={fontClasses.WordCreatetitle}
          style={{ color: Common.allColor.bodyText }}
        >
          {type === "word"
            ? "N" + serial_number + "：" + chinese_name
            : chinese_name}
        </div>
      </Box>
    </Box>
  );
};

export const AdminCreatorInfo: React.FC<AdminCreatorInfoProps> = ({
  author,
  create_timestamp,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box className={classes.creatorInfoControl}>
      <Typography className={fontClasses.unboldFont}>
        <Box component="span" color={aColor.darkGreyBodyText}>
          提交人： {author}
        </Box>
      </Typography>
      <Typography className={fontClasses.unboldFont}>
        <Box component="span" color={aColor.darkGreyBodyText}>
          提交时间： {create_timestamp}
        </Box>
      </Typography>
    </Box>
  );
};

export const AdminDivider: React.FC<AdminDividerProps> = ({ value }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignContent="center"
      flexGrow={1}
      style={{ maxHeight: "40px" }}
    >
      <Box display="flex" style={{ marginTop: "10px", marginBottom: "10px" }}>
        <Divider
          variant="inset"
          className={classes.dividerControl}
          style={{ width: "80px" }}
        />
        <div className={fontClasses.CardBasicInfo}> {value} </div>
        <Divider
          variant="inset"
          className={classes.dividerControl}
          style={{ width: "600px" }}
        />
      </Box>
    </Box>
  );
};

const PopInfo: React.FC<{
  uuid: string;
  handleClose: () => void;
  handleDelete: (uuid: string) => Promise<void>;
}> = ({ uuid, handleClose, handleDelete }) => {
  const fontClasses = Common.fontStyles();
  const btnClasses = Common.buttonStyles();

  return (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="column"
      justifyContent="space-between"
      width="224px"
      height="90px"
      m={1}
    >
      <Box display="flex" flexGrow={1} alignItems="center">
        <Box display="flex" pr={1}>
          {Icons.alertIconSmall}
        </Box>
        <Typography className={fontClasses.unboldFont}>
          确定要删除吗？
        </Typography>
      </Box>
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="flex-end"
        alignItems="flex-end"
      >
        <Box p={1}>
          <Button className={btnClasses.SecondarySmall} onClick={handleClose}>
            取消
          </Button>
        </Box>
        <Box p={1}>
          <Button
            className={btnClasses.PrimarySmall}
            onClick={() => handleDelete(uuid)}
          >
            确定
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export const AdminDelete: React.FC<{
  uuid: string;
  handleDelete: (uuid: string) => Promise<void>;
  ifUserPanel?: boolean;
}> = ({ uuid, handleDelete, ifUserPanel = false }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [canDeleteFlag, setCanDeleteFlag] = useState(false);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePressDel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  React.useEffect(() => {
    void (async () => {
      if (ifUserPanel) {
        try {
          const canDelete = await UserService.canDeleteUser(uuid);
          setCanDeleteFlag(canDelete);
        } catch (e) {
          console.error(e);
        }
      }
    })();
  }, [uuid, ifUserPanel]);

  if (ifUserPanel && !canDeleteFlag) {
    return null;
  }
  return (
    <Box justifyContent="center">
      <Typography
        className={[fontClasses.unboldFont, classes.delTypo].join(" ")}
        onClick={handlePressDel}
      >
        删除
      </Typography>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <PopInfo
          uuid={uuid}
          handleClose={handleClose}
          handleDelete={handleDelete}
        />
      </Popover>
    </Box>
  );
};

export const AdminSnackbar: React.FC<AdminSnackbarProps> = ({
  status,
  open,
  handleClose,
}) => {
  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  if (status === 0) {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          审核成功！
        </Alert>
      </Snackbar>
    );
  } else {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          审核失败！
        </Alert>
      </Snackbar>
    );
  }
};

export const AdminUserAddSnackbar: React.FC<AdminSnackbarProps> = ({
  status,
  open,
  handleClose,
}) => {
  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  if (status === 0) {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          添加成功！
        </Alert>
      </Snackbar>
    );
  } else {
    return (
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {Map.errorCoderMap[status]}
        </Alert>
      </Snackbar>
    );
  }
};

export const AdminReviewRadio: React.FC<AdminReviewRadioProps> = ({
  selectedValue,
  stateList,
  ifApplyPreviewPassed = false,
  handleChange,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" height="35px">
      <Box display="flex" flexBasis="100px">
        <div className={fontClasses.CardDisplayItem}>审核状态</div>
      </Box>
      <Box display="flex" flexGrow={1}>
        {stateList.map((elem: string, index: number) => {
          return (
            <Box
              key={index}
              display="flex"
              flexDirection="row"
              alignItems="center"
            >
              <Radio
                checked={selectedValue === elem}
                onChange={handleChange}
                value={elem}
                size="small"
                className={classes.radioControl}
              />
              <div className={fontClasses.unboldFont}>
                {ifApplyPreviewPassed
                  ? ReviewStatusUtil.reviewStatusPassedPreviewMap[elem]
                  : ReviewStatusUtil.reviewStatusMap[elem]}
              </div>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export const AdminReviewInput: React.FC<AdminReviewInputProps> = ({
  reviewComment,
  handleInput,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      marginTop="10px"
    >
      <Box display="flex" flexBasis="100px">
        <div className={fontClasses.CardDisplayItem}>审核意见</div>
      </Box>
      <Box display="flex">
        <TextField
          variant="outlined"
          className={classes.textControl}
          value={reviewComment}
          onChange={handleInput}
        />
      </Box>
    </Box>
  );
};

export const AdminReviewDetail: React.FC<{
  type: string;
  jsonData: WordJSON | templateJSON | DevelopmentDataJSON;
}> = ({ type, jsonData }) => {
  return (
    <Box display="flex" flexDirection="column">
      {reviewList.map((value) => {
        return (
          <AdminItemDisplay
            key={value}
            type={type}
            jsonData={jsonData}
            value={value}
          />
        );
      })}
    </Box>
  );
};
