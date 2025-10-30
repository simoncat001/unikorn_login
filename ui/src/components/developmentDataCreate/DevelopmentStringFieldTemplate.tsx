import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Common from "../../common/Common";
import { RouteToCenterDev } from "./DevelopmentDataUtils";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    styledDevelopTextField: {
      padding: "0px",
      "& .MuiInputBase-root": {
        height: "32px",
        paddingLeft: "0px",
        backgroundColor: "white",
      },
      "& .MuiOutlinedInput-input": {
        height: "32px",
        padding: "0px 11px",
        backgroundColor: "white",
      },
    },
    styledDevelopTextFieldShort: {
      width: "300px",
      padding: "0px",
      "& .MuiInputBase-root": {
        height: "32px",
        paddingLeft: "0px",
        backgroundColor: "white",
      },
      "& .MuiOutlinedInput-input": {
        height: "32px",
        padding: "0px 11px",
        backgroundColor: "white",
      },
    },
    RowStretch: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
      flexGrow: 1,
    },
    Str: {
      minHeight: "92px",
      marginLeft: "16px",
      marginRight: "16px",
      borderColor: aColor.lighterBorder,
    },
    StrAsSub: {
      minHeight: "32px",
      marginLeft: "0px",
      marginRight: "0px",
      borderColor: aColor.lighterBorder,
    },
    ColumnStrItem: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    StrAsSubItem: {
      marginLeft: "16px",
      marginRight: "16px",
      minHeight: "32px",
    },
    StrItem: {
      marginLeft: "16px",
      marginRight: "16px",
      height: "60px",
    },
    NoSpinArrow: {
      "& input[type=number]": {
        "-moz-appearance": "textfield",
      },
      "& input[type=number]::-webkit-outer-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },
      "& input[type=number]::-webkit-inner-spin-button": {
        "-webkit-appearance": "none",
        margin: 0,
      },
      "& .MuiInputLabel-outlined.MuiInputLabel-marginDense": {
        transform: "translate(14px, 9px) scale(1)",
      },
      "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
      },
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
FieldTemplate for single element's title
used in other fieldTemplate (Date,String,Number, etc) as a component
*/
function FieldTemplateDevelopmentDataTitle(props: FieldTemplateProps) {
  const fontClasses = Common.fontStyles();
  return (
    <Box display="flex" flexDirection="column">
      <Typography style={{ marginTop: "4px" }} className={fontClasses.boldFont}>
        <span style={{ color: aColor.requiredRed }}>
          {props.required ? "*" : ""}
        </span>
        {props.schema.title}：
      </Typography>
      <RouteToCenterDev title={props.schema.title ? props.schema.title : ""} />
    </Box>
  );
}

/*
FieldTemplate for string element
contains background, element title
*/
function FieldTemplateDevelopmentStr(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box
      className={[classes.Str, classes.RowStretch].join(" ")}
      style={{ backgroundColor: aColor.accentBackground }}
      {...commonProps.Border}
    >
      <Box className={[classes.StrItem, classes.ColumnStrItem].join(" ")}>
        {FieldTemplateDevelopmentDataTitle(props)}
        <TextField
          className={classes.styledDevelopTextField}
          required={props.required}
          type="string"
          variant="outlined"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") event.preventDefault();
            },
          }}
          onChange={(event) =>
            props.onChange(
              event.target.value !== "" ? event.target.value : undefined
            )
          }
        />
      </Box>
    </Box>
  );
}

function FieldTemplateDevelopmentMGIDCustomField(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box
      className={[classes.Str, classes.RowStretch].join(" ")}
      style={{ backgroundColor: aColor.accentBackground }}
      {...commonProps.Border}
    >
      <Box className={[classes.StrItem, classes.ColumnStrItem].join(" ")}>
        {FieldTemplateDevelopmentDataTitle(props)}
        <TextField
          className={[classes.styledDevelopTextField, classes.NoSpinArrow].join(
            " "
          )}
          size="small"
          required={props.required}
          type="number"
          variant="outlined"
          label="填入四位数字"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") event.preventDefault();
            },
          }}
          onChange={(event) => props.onChange(event.target.value)}
        />
      </Box>
    </Box>
  );
}

/*
FieldTemplate for string element in an Object
not contain background, but has title
*/
function FieldTemplateDevelopmentStrObjectItem(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={[classes.StrAsSub, classes.RowStretch].join(" ")}>
      <Box className={[classes.StrAsSubItem, classes.ColumnStrItem].join(" ")}>
        {FieldTemplateDevelopmentDataTitle(props)}
        <TextField
          className={classes.styledDevelopTextField}
          required={props.required}
          type="string"
          variant="outlined"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") event.preventDefault();
            },
          }}
          onChange={(event) =>
            props.onChange(
              event.target.value !== "" ? event.target.value : undefined
            )
          }
        />
      </Box>
    </Box>
  );
}

/*
FieldTemplate for string element in an array
not contain background, not have title
*/
function FieldTemplateDevelopmentStrArrayItem(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={[classes.StrAsSub, classes.RowStretch].join(" ")}>
      <Box className={[classes.StrAsSubItem, classes.ColumnStrItem].join(" ")}>
        <TextField
          className={classes.styledDevelopTextField}
          required={props.required}
          type="string"
          variant="outlined"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") event.preventDefault();
            },
          }}
          onChange={(event) =>
            props.onChange(
              event.target.value !== "" ? event.target.value : undefined
            )
          }
        />
      </Box>
    </Box>
  );
}

const exportStrFieldTemplate = {
  FieldTemplateDevelopmentStr,
  FieldTemplateDevelopmentMGIDCustomField,
  FieldTemplateDevelopmentStrObjectItem,
  FieldTemplateDevelopmentStrArrayItem,
};

export default exportStrFieldTemplate;
