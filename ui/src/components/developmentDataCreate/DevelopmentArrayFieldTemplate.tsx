import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ArrayFieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Common from "../../common/Common";
import Icon from "../Icon";
import React from "react";
import { Collapse } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { RouteToCenterDev } from "./DevelopmentDataUtils";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    IconButtonControl: {
      height: "16px",
      padding: "0px",
    },
    RowStretch: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "row",
      alignSelf: "stretch",
    },
    Array: {
      marginLeft: "16px",
      marginRight: "16px",
      minHeight: "60px",
      borderColor: aColor.lighterBorder,
      backgroundColor: aColor.accentBackground,
    },
    ArrayList: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      marginTop: "0px",
      minHeight: "60px",
    },
    ArrayHead: {
      display: "flex",
      flexDirection: "column",
      alignSelf: "stretch",
      minHeight: "44px",
      marginTop: "0px",
      borderColor: aColor.lighterBorder,
    },
    ArrayTitle: {
      display: "flex",
      alignSelf: "stretch",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderColor: aColor.lighterBorder,
      minHeight: "44px",
    },
    ArrayItem: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: "16px",
    },
    StylesNoHoverBorderButton: {
      "&:hover": {
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      },
      minWidth: "18.66px",
      padding: "0px",
      marginLeft: "16px",
    },
  })
);

const commonProps = {
  Border: {
    border: 1,
    borderLeft: 3,
    borderRight: 3,
  },
  buttonDisable: {
    disableRipple: true,
    disableElevation: true,
    disableFocusRipple: true,
  },
};

/*
arrayFieldTemplate for development data with type : array
*/
function ArrayFieldTemplateDevelopmentData(props: ArrayFieldTemplateProps) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aColor = Common.allColor;
  const buttonClasses = Common.buttonStyles();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <Box
      className={[classes.Array, classes.RowStretch].join(" ")}
      {...commonProps.Border}
    >
      <Box className={classes.ArrayList}>
        <Box className={classes.ArrayHead} border={0}>
          <Box className={classes.ArrayTitle}>
            <Box
              display="flex"
              flexDirection="column"
              marginTop="16px"
              marginLeft="16px"
            >
              <Typography className={fontClasses.boldFont}>
                <span style={{ color: aColor.requiredRed }}>
                  {props.required ? "*" : ""}
                </span>{" "}
                {props.schema.title}：
              </Typography>
              <RouteToCenterDev
                title={props.schema.title ? props.schema.title : ""}
              />
            </Box>
            {props.items.length >= 1 ? (
              <IconButton
                classes={{
                  root: classes.IconButtonControl,
                }}
                disableRipple={true}
                disableFocusRipple
                style={{
                  marginRight: "16px",
                  marginTop: "16px",
                }}
                onClick={handleClick}
              >
                {open ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            ) : (
              <div></div>
            )}
          </Box>
        </Box>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {props.items.map((element, i) => (
            <div key={i}>
              <Box
                className={[classes.RowStretch, classes.ArrayItem].join(" ")}
              >
                {element.children}
                <Button
                  onClick={element.onDropIndexClick(element.index)}
                  className={buttonClasses.NoHoverBorderButton}
                  {...commonProps.buttonDisable}
                >
                  <Typography
                    className={fontClasses.unboldFont}
                    style={{ color: aColor.primaryColor }}
                  >
                    删除
                  </Typography>
                </Button>
              </Box>
            </div>
          ))}
        </Collapse>
        <div>
          <Button
            className={classes.StylesNoHoverBorderButton}
            onClick={() => {
              props.onAddClick();
            }}
            type="button"
            {...commonProps.buttonDisable}
          >
            {Icon.addCircleOutlineSmall}
          </Button>
        </div>
      </Box>
    </Box>
  );
}

const exportArrayFieldTemplate = {
  ArrayFieldTemplateDevelopmentData,
};

export default exportArrayFieldTemplate;
