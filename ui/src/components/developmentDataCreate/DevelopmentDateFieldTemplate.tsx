import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Common from "../../common/Common";

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
      marginTop: "6px",
    },
    RowStretch: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
    },
    Date: {
      flexGrow: 1,
      minHeight: "92px",
      marginLeft: "16px",
      marginRight: "16px",
      borderColor: aColor.lighterBorder,
    },
    DateAsSub: {
      flexGrow: 1,
      minHeight: "32px",
      marginLeft: "0px",
      marginRight: "0px",
      borderColor: aColor.lighterBorder,
    },
    ColumnDateItem: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      width: "300px",
    },
    Height: {
      height: "60px",
    },
    shortHeight: {
      minHeight: "32px",
    },
    DateAsSubItem: {
      marginLeft: "16px",
      marginRight: "16px",
      minHeight: "32px",
    },
    DateItem: {
      marginLeft: "16px",
      marginRight: "16px",
      height: "60px",
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

function FieldTemplateDate(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box
      className={[classes.Date, classes.RowStretch].join(" ")}
      style={{ backgroundColor: aColor.accentBackground }}
      border={1}
      borderLeft={3}
      borderRight={3}
    >
      <Box className={[classes.ColumnDateItem, classes.DateItem].join(" ")}>
        {FieldTemplateDevelopmentDataTitle(props)}
        <TextField
          className={classes.styledDevelopTextFieldShort}
          required={props.required}
          type="date"
          variant="outlined"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            inputProps: { max: new Date().toISOString().substring(0, 10) },
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

function FieldTemplateDateObjectItem(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={[classes.DateAsSub, classes.RowStretch].join(" ")}>
      <Box
        className={[
          classes.ColumnDateItem,
          classes.DateAsSubItem,
          classes.Height,
        ].join(" ")}
      >
        {FieldTemplateDevelopmentDataTitle(props)}
        <TextField
          className={classes.styledDevelopTextFieldShort}
          required={props.required}
          type="date"
          variant="outlined"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            inputProps: { max: new Date().toISOString().substring(0, 10) },
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

function FieldTemplateDateArrayItem(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={classes.DateAsSub}>
      <Box
        className={[
          classes.ColumnDateItem,
          classes.DateAsSubItem,
          classes.shortHeight,
        ].join(" ")}
      >
        <TextField
          className={classes.styledDevelopTextFieldShort}
          required={props.required}
          type="date"
          variant="outlined"
          value={props.formData !== undefined ? props.formData : ""}
          InputProps={{
            inputProps: { max: new Date().toISOString().substring(0, 10) },
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

const exportDateFieldTemplate = {
  FieldTemplateDate,
  FieldTemplateDateObjectItem,
  FieldTemplateDateArrayItem,
};

export default exportDateFieldTemplate;
