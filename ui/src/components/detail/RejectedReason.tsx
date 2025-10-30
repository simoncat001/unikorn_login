import React from "react";
import {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  REVIEW_STATUS_PASSED_REVIEW,
  REVIEW_STATUS_REJECTED,
  REVIEW_STATUS_DEPRECATED,
} from "../../common/ReviewStatusUtils";
import { Box, Typography, Popover } from "@material-ui/core";
import { DetailStateIcon } from "../Icon";

import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      float: "left",
      marginLeft: "12px",
    },
    popover: {
      pointerEvents: "none",
    },
    paper: {
      padding: theme.spacing(2),
      maxWidth: "400px",
    },
  })
);

const RejectedReason: React.FC<{
  review_status: string;
  rejected_reason: string;
}> = ({ review_status, rejected_reason }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  switch (review_status) {
    case REVIEW_STATUS_REJECTED:
    case REVIEW_STATUS_DRAFT:
      return (
        <Box>
          <Box
            className={classes.icon}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          >
            <DetailStateIcon state={review_status} />
          </Box>
          <Popover
            id="mouse-over-popover"
            className={classes.popover}
            classes={{
              paper: classes.paper,
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            <Typography style={{ wordBreak: "break-all" }}>
              {rejected_reason}
            </Typography>
          </Popover>
        </Box>
      );
    case REVIEW_STATUS_PASSED_REVIEW:
    case REVIEW_STATUS_PASSED_REVIEW_PREVIEW:
    case REVIEW_STATUS_DEPRECATED:
      return (
        <Box>
          <Box className={classes.icon}>
            <DetailStateIcon state={review_status} />
          </Box>
        </Box>
      );
    default:
      return null;
  }
};

export default RejectedReason;
