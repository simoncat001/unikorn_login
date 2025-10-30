import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldTemplateProps } from "@rjsf/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    textFeildSmall: {
      width: "91px",
    },
  })
);
function FieldTemplateStr(props: FieldTemplateProps) {
  return (
    <TextField
      type="string"
      label={props.schema.title}
      value={props.formData !== undefined ? props.formData : ""}
      InputProps={{
        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") event.preventDefault();
        },
      }}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
}

function FieldTemplateNumber(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <TextField
      className={classes.NoSpinArrow}
      type="number"
      label={props.schema.title}
      value={props.formData !== undefined ? props.formData : ""}
      onChange={(event) =>
        props.onChange(
          event.target.value !== "" ? parseFloat(event.target.value) : undefined
        )
      }
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {props.schema.description}
          </InputAdornment>
        ),
        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") event.preventDefault();
        },
      }}
    />
  );
}

function FieldTemplateNumberRangeItem(props: FieldTemplateProps) {
  const classes = useStyles();
  const idList = props.id.split("_");
  const rangeRangeName = idList[idList.length - 2];
  const ifEnd = props.id.indexOf("end") !== -1;

  return (
    <TextField
      className={[classes.textFeildSmall, classes.NoSpinArrow].join(" ")}
      label={ifEnd ? " " : rangeRangeName}
      type="number"
      value={props.formData !== undefined ? props.formData : ""}
      onChange={(event) =>
        props.onChange(
          event.target.value !== "" ? parseFloat(event.target.value) : undefined
        )
      }
      InputProps={
        ifEnd
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  {props.schema.description}
                </InputAdornment>
              ),
              onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.preventDefault();
              },
            }
          : {
              onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.preventDefault();
              },
            }
      }
    />
  );
}

const ApplicationFieldTemplate = {
  FieldTemplateStr,
  FieldTemplateNumber,
  FieldTemplateNumberRangeItem,
};

export default ApplicationFieldTemplate;
