import { makeStyles, createStyles } from "@material-ui/core/styles";

import Common from "../common/Common";

const aColor = Common.allColor;

export const useStyles = makeStyles(() =>
  createStyles({
    link: {
      color: aColor.bodyText,
      "&:hover": {
        color: aColor.primaryColor,
        textDecoration: "none",
      },
    },
    data_url: {
      color: aColor.primaryColor,
      textDecoration: "underline",
    },
    List: {
      marginTop: "34px",
      minWidth: "768px",
    },
  })
);

// btn group
export const btnList = [
  "all",
  "draft",
  "waiting_review",
  "passed_review",
  "rejected",
];

export const rowsPerPage = 9;
