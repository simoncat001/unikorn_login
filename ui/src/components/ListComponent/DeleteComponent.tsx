import { useState } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Box, Typography, Popover, Button } from "@material-ui/core";

import Common from "../../common/Common";
import {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_REJECTED,
} from "../../common/ReviewStatusUtils";
import Icons from "../Icon";
import { WordListData } from "../../api/WordService";
import { TemplateListData } from "../../api/TemplateService";
import { DevelopmentListData } from "../../api/DevelopmentDataService";

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
  createStyles({
    delTypo: {
      color: aColor.primaryColor,
      "&:hover": {
        background: "transparent",
        color: aColor.seoncdaryBodyText,
        cursor: "pointer",
      },
    },
  })
);

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

const DeleteComponent: React.FC<{
  row: WordListData | TemplateListData | DevelopmentListData;
  handleDelete: (uuid: string) => Promise<void>;
}> = ({ row, handleDelete }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePressDel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  switch (row.state) {
    case REVIEW_STATUS_REJECTED:
    case REVIEW_STATUS_DRAFT:
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
              uuid={row.uuid}
              handleClose={handleClose}
              handleDelete={handleDelete}
            />
          </Popover>
        </Box>
      );
    default:
      return null;
  }
};

export default DeleteComponent;
