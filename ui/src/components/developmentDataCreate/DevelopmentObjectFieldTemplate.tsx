import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ObjectFieldTemplateProps } from "@rjsf/core";
import Box from "@material-ui/core/Box";
import Common from "../../common/Common";
import React from "react";
import { Typography } from "@material-ui/core";
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
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
      flexGrow: 1,
    },
    Object: {
      marginLeft: "16px",
      marginRight: "16px",
      minHeight: "60px",
      borderColor: aColor.lighterBorder,
      backgroundColor: aColor.background,
    },
    ObjectList: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      marginTop: "0px",
      minHeight: "60px",
    },
    ObjectHead: {
      display: "flex",
      flexDirection: "column",
      alignSelf: "stretch",
      height: "60px",
      marginTop: "0px",
      borderColor: aColor.lighterBorder,
    },
    ObjectTitle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      backgroundColor: aColor.accentBackground,
      borderColor: aColor.lighterBorder,
      height: "60px",
    },
    ObjectItem: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
    NumRangeObject: {
      alignSelf: "stretch",
      minHeight: "92px",
      marginLeft: "16px",
      marginRight: "16px",
      borderColor: aColor.lighterBorder,
      backgroundColor: aColor.accentBackground,
    },
    NumRangeObjectAsSub: {
      alignSelf: "stretch",
      minHeight: "32px",
      marginLeft: "16px",
      marginRight: "16px",
    },
    NumRangeObjectItem: {
      DateItem: {
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        height: "60px",
      },
    },
    RowCenter: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    ColumnCenter: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    ObjectForm: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "700px",
    },
  })
);

const commonProps = {
  Border: {
    border: 1,
    borderLeft: 3,
    borderRight: 3,
  },
};

/*
objectFieldTemplate for development data create: with type number range
*/
function ObjectFieldTemplateNumRange(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aColor = Common.allColor;
  const start_box = props.properties[0].content;
  const end_box = props.properties[1].content;
  return (
    <Box
      className={[classes.NumRangeObject, classes.RowStretch].join(" ")}
      {...commonProps.Border}
    >
      <Box
        className={classes.NumRangeObjectItem}
        marginLeft="16px"
        marginRight="16px"
      >
        <Typography className={fontClasses.boldFont}>
          <span style={{ color: aColor.requiredRed }}>
            {props.required ? "*" : ""}
          </span>
          {props.title}：
        </Typography>
        <Box className={classes.RowCenter}>
          <Box>{start_box}</Box>
          <Typography> ~ </Typography>
          <Box>{end_box}</Box>
          <Typography>{end_box.props.schema.description}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/*
objectFieldTemplate for development data create: with type number range
as an object Item, it contains no background, but contains title
*/
function ObjectFieldTemplateNumRangeObjectItem(
  props: ObjectFieldTemplateProps
) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aColor = Common.allColor;
  const start_box = props.properties[0].content;
  const end_box = props.properties[1].content;
  return (
    <Box
      className={[classes.NumRangeObjectAsSub, classes.RowStretch].join(" ")}
    >
      <Box className={classes.NumRangeObjectItem}>
        <Typography className={fontClasses.boldFont}>
          <span style={{ color: aColor.requiredRed }}>
            {props.required ? "*" : ""}
          </span>
          {props.title}：
        </Typography>
        <Box className={classes.RowCenter}>
          <Box>{start_box}</Box>
          <Typography> ~ </Typography>
          <Box>{end_box}</Box>
          <Typography>{end_box.props.schema.description}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/*
objectFieldTemplate for development data create: with type number range
as an array Item, it contains no background, and contains no title
*/
function ObjectFieldTemplateNumRangeArrayItem(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  const start_box = props.properties[0].content;
  const end_box = props.properties[1].content;
  return (
    <Box
      className={[classes.NumRangeObjectAsSub, classes.RowStretch].join(" ")}
    >
      <Box className={classes.NumRangeObjectItem}>
        <Box className={classes.RowCenter}>
          <Box>{start_box}</Box>
          <Typography> ~ </Typography>
          <Box>{end_box}</Box>
          <Typography>{end_box.props.schema.description}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

/*
  objectField Template for development data create total form,
  it doesnt contain backgroundcolor and title
  */
function ObjectFieldTemplateForm(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={classes.RowCenter}>
      <Box className={classes.ObjectForm}>
        <Box className={classes.ColumnCenter}>
          {props.properties.map((index, i) => (
            <Box key={i}>{index.content}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

/*
  objectField Template for development data create with type: object,
  it contains background Color and display sub-items of the object.
  */
function ObjectFieldTemplateItem(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const aColor = Common.allColor;

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <Box className={classes.Object} {...commonProps.Border}>
      <Box className={classes.ObjectList}>
        <Box className={classes.ObjectHead} border={0} borderBottom={1}>
          <Box className={classes.ObjectTitle}>
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

            {props.properties.length >= 1 ? (
              <IconButton
                classes={{ root: classes.IconButtonControl }}
                disableRipple
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
          {props.properties.map((index, i) => (
            <Box
              key={i + index.name}
              marginTop={i === 0 ? "16px" : "0px"}
              marginBottom={i === props.properties.length - 1 ? "16px" : "0px"}
              className={classes.ObjectItem}
            >
              {index.content}
            </Box>
          ))}
        </Collapse>
      </Box>
    </Box>
  );
}

const exportObjectFieldTemplate = {
  ObjectFieldTemplateNumRange,
  ObjectFieldTemplateNumRangeObjectItem,
  ObjectFieldTemplateNumRangeArrayItem,
  ObjectFieldTemplateForm,
  ObjectFieldTemplateItem,
};

export default exportObjectFieldTemplate;
