import Common from "../common/Common";
import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Breadcrumbs, Link, Divider } from "@material-ui/core";
import Icon from "./Icon";

const aColor = Common.allColor;

export const useStyles = makeStyles(() =>
  createStyles({
    detailBackground: {
      backgroundColor: aColor.accentBackground,
      height: "auto",
      maxWidth: "688px",
      marginTop: "8px",
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
    divider: {
      height: "auto",
      margin: "8px 0",
      backgroundColor: aColor.border,
    },
  })
);

export const BreadNav: React.FC<{
  HOME_PATH: string;
  breadName: string;
  DETAIL_PATH: string;
  editName?: string;
  EDIT_PATH?: string;
  step?: number;
}> = ({ HOME_PATH, breadName, DETAIL_PATH, editName, EDIT_PATH, step = 1 }) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <Breadcrumbs aria-label="breadcrumb">
        <Link color="inherit" href={HOME_PATH}>
          {Icon.homeIconSmall}
        </Link>
        <Link color={step === 1 ? "textPrimary" : "inherit"} href={DETAIL_PATH}>
          <Typography className={fontClasses.unboldFont}>
            {breadName}
          </Typography>
        </Link>
        {step === 2 ? (
          <Link color="textPrimary" href={EDIT_PATH}>
            <Typography className={fontClasses.unboldFont}>
              {editName}
            </Typography>
          </Link>
        ) : null}
      </Breadcrumbs>
    </Box>
  );
};

export const DetailDivier: React.FC<{}> = () => {
  const classes = useStyles();

  return (
    <Divider
      orientation="vertical"
      variant="middle"
      className={classes.divider}
    />
  );
};
