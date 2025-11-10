import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Common from "../../common/Common";

const aColor = Common.allColor;

const commonProps = {
  NumberBorder: {
    border: 1,
    borderLeft: 3,
    borderRight: 3,
  },
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    styledDevelopTextField: {
      width: "100%",
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
    },
    Number: {
      flexGrow: 1,
      minHeight: "92px",
      marginLeft: "16px",
      marginRight: "16px",
      borderColor: aColor.lighterBorder,
    },
    NumberAsSub: {
      flexGrow: 1,
      minHeight: "32px",
      marginLeft: "0px",
      marginRight: "0px",
      borderColor: aColor.lighterBorder,
    },
    ColumnNumberItem: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    NumberAsSubItem: {
      marginLeft: "16px",
      marginRight: "16px",
      minHeight: "32px",
    },
    NumberItem: {
      marginLeft: "16px",
      marginRight: "16px",
      height: "60px",
    },
    NumRange: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      width: "300px",
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
    },
  })
);

/*
FieldTemplate for single element's title
used in other fieldTemplate (Date,String,Number, etc) as a component
*/
function FieldTemplateDevelopmentDataTitle(props: FieldTemplateProps) {
  const fontClasses = Common.fontStyles();
  return (
    <Box display="flex">
      <Typography style={{ marginTop: "4px" }} className={fontClasses.boldFont}>
        <span style={{ color: aColor.requiredRed }}>
          {props.required ? "*" : ""}
        </span>
        {props.schema.title}：
      </Typography>
    </Box>
  );
}

function FieldTemplateDevelopmentNumber(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box
      className={[classes.Number, classes.RowStretch].join(" ")}
      {...commonProps.NumberBorder}
      style={{ backgroundColor: aColor.accentBackground }}
    >
      <Box className={[classes.NumberItem, classes.ColumnNumberItem].join(" ")}>
        {FieldTemplateDevelopmentDataTitle(props)}
        <Box display="flex">
          <Box display="flex" flexGrow={1}>
            <TextField
              className={[
                classes.styledDevelopTextField,
                classes.NoSpinArrow,
              ].join(" ")}
              required={props.required}
              type="number"
              variant="outlined"
              value={props.formData !== undefined ? props.formData : ""}
              InputProps={{
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") event.preventDefault();
                },
              }}
              onChange={(event) =>
                props.onChange(
                  event.target.value !== ""
                    ? parseFloat(event.target.value)
                    : undefined
                )
              }
            />
          </Box>
          <Box display="flex">{props.description}</Box>
        </Box>
      </Box>
    </Box>
  );
}

function FieldTemplateDevelopmentNumberObjectItem(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={[classes.NumberAsSub, classes.RowStretch].join(" ")}>
      <Box
        className={[classes.NumberAsSubItem, classes.ColumnNumberItem].join(
          " "
        )}
      >
        {FieldTemplateDevelopmentDataTitle(props)}
        <Box display="flex">
          <Box display="flex" flexGrow={1}>
            <TextField
              className={[
                classes.styledDevelopTextField,
                classes.NoSpinArrow,
              ].join(" ")}
              required={props.required}
              type="number"
              variant="outlined"
              value={props.formData !== undefined ? props.formData : ""}
              InputProps={{
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") event.preventDefault();
                },
              }}
              onChange={(event) =>
                props.onChange(
                  event.target.value !== ""
                    ? parseFloat(event.target.value)
                    : undefined
                )
              }
            />
          </Box>
          <Box display="flex">{props.description}</Box>
        </Box>
      </Box>
    </Box>
  );
}

function FieldTemplateDevelopmentNumberArrayItem(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={[classes.NumberAsSub, classes.RowStretch].join(" ")}>
      <Box
        className={[classes.NumberAsSubItem, classes.ColumnNumberItem].join(
          " "
        )}
      >
        <Box display="flex">
          <Box display="flex" flexGrow={1}>
            <TextField
              className={[
                classes.styledDevelopTextField,
                classes.NoSpinArrow,
              ].join(" ")}
              required={props.required}
              type="number"
              variant="outlined"
              value={props.formData !== undefined ? props.formData : ""}
              InputProps={{
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") event.preventDefault();
                },
              }}
              onChange={(event) =>
                props.onChange(
                  event.target.value !== ""
                    ? parseFloat(event.target.value)
                    : undefined
                )
              }
            />
          </Box>
          <Box display="flex">{props.description}</Box>
        </Box>
      </Box>
    </Box>
  );
}

function FieldTemplateDevelopmentNumberRange(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={classes.NumRange}>
      <TextField
        className={[
          classes.styledDevelopTextFieldShort,
          classes.NoSpinArrow,
        ].join(" ")}
        required={props.required}
        type="number"
        variant="outlined"
        value={props.formData !== undefined ? props.formData : ""}
        InputProps={{
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") event.preventDefault();
          },
        }}
        onChange={(event) =>
          props.onChange(
            event.target.value !== ""
              ? parseFloat(event.target.value)
              : undefined
          )
        }
      />
    </Box>
  );
}

const exportNumFieldTemplate = {
  FieldTemplateDevelopmentNumber,
  FieldTemplateDevelopmentNumberObjectItem,
  FieldTemplateDevelopmentNumberArrayItem,
  FieldTemplateDevelopmentNumberRange,
};

export default exportNumFieldTemplate;
