import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { useState, useEffect } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import OrganizationService from "../../api/OrganizationService";
import Common from "../../common/Common";
import Map from "../../common/Map";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    templateBox: {
      width: "110px",
      float: "left",
      marginRight: "13px",
    },
    styledTextField: {
      width: "430px",
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
    styledTextFieldNumber: {
      width: "430px",
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
      "& .MuiInputLabel-outlined.MuiInputLabel-marginDense": {
        transform: "translate(14px, 9px) scale(1)",
      },
      "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
      },
    },
    styledTextFieldMultiline: {
      width: "430px",
      padding: "0px",
      "& .MuiInputBase-root": {
        height: "88px",
        paddingLeft: "0px",
        backgroundColor: "white",
      },
      "& .MuiOutlinedInput-multiline": {
        height: "88px",
        padding: "10px 11px",
        backgroundColor: "white",
      },
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
    styledTextFieldAutoComplete: {
      width: "430px",
      padding: "0px",
      backgroundColor: "inhebit",
      "& .MuiInputBase-root": {
        paddingLeft: "0px",
        backgroundColor: "inhebit",
      },
      "& .MuiOutlinedInput-input": {
        paddingLeft: "11px",
        backgroundColor: "inhebit",
      },
    },
  })
);

function FieldTemplateTitle(props: FieldTemplateProps) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box className={classes.templateBox}>
      <Typography
        align="right"
        style={{ marginTop: "4px" }}
        className={fontClasses.boldFont}
      >
        <span style={{ color: aColor.requiredRed }}>
          {props.required ? "*" : ""}
        </span>
        {props.schema.title}：
      </Typography>
    </Box>
  );
}

function FieldTemplateStr(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box width="600px">
      {FieldTemplateTitle(props)}
      <TextField
        className={classes.styledTextField}
        required={props.required}
        type="string"
        variant="outlined"
        value={
          props.schema.default === "" ? props.formData : props.schema.default
        }
        InputProps={{
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") event.preventDefault();
          },
        }}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </Box>
  );
}

function FieldTemplateStrMultiline(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box width="600px">
      {FieldTemplateTitle(props)}
      <TextField
        className={classes.styledTextFieldMultiline}
        required={props.required}
        type="string"
        variant="outlined"
        multiline
        rows={4}
        value={
          props.schema.default === "" ? props.formData : props.schema.default
        }
        onChange={(event) => props.onChange(event.target.value)}
      />
    </Box>
  );
}

function getEnumList(props: FieldTemplateProps) {
  const enumListOrigin =
    props.schema.enum !== undefined ? props.schema.enum : [];
  var enumList: string[] = [];

  for (var i = 0; i < enumListOrigin.length; i++) {
    enumList.push(enumListOrigin[i] as string);
  }
  return enumList;
}

function FieldTemplateEnum(props: FieldTemplateProps) {
  const classes = useStyles();
  const title = props.schema.title !== undefined ? props.schema.title : "";
  const enumList = getEnumList(props);
  return (
    <Box style={{ width: "600px" }}>
      {FieldTemplateTitle(props)}
      <TextField
        className={classes.styledTextField}
        variant="outlined"
        select
        SelectProps={{ native: true }}
        value={props.formData}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {enumList.map((option: string, index: number) => (
          <option key={index} value={enumList[index]}>
            {Map.enumType[title][option]}
          </option>
        ))}
      </TextField>
    </Box>
  );
}

function FieldTemplateNumber(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box width="600px">
      {FieldTemplateTitle(props)}
      <TextField
        size="small"
        className={[classes.styledTextFieldNumber, classes.NoSpinArrow].join(
          " "
        )}
        required={props.required}
        type="number"
        variant="outlined"
        label="填入四位数字"
        value={
          props.schema.default === "" ? props.formData : props.schema.default
        }
        InputProps={{
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") event.preventDefault();
          },
        }}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </Box>
  );
}

function FieldTemplateStrAutoComplete(props: FieldTemplateProps) {
  const [beginWord, setBeginWord] = useState("");
  const [organizationNameList, setOrganizationNameList] = useState<string[]>(
    []
  );
  const classes = useStyles();

  useEffect(() => {
    void (async () => {
      try {
        if (beginWord !== "" && beginWord.indexOf("'") === -1) {
          const organizationList: string[] =
            await OrganizationService.getOrganizationListListWithBegin(
              beginWord
            );
          setOrganizationNameList(organizationList);
        }
      } catch (e) {
        setOrganizationNameList([]);
        console.error(e);
      }
    })();
  }, [beginWord]);

  function StrAutoComplete(props: FieldTemplateProps) {
    return (
      <Box width="600px">
        {FieldTemplateTitle(props)}
        <Autocomplete
          size="small"
          freeSolo
          disableClearable
          value={props.formData}
          options={organizationNameList.map((option) => option)}
          onChange={(event, newValue: string) => {
            props.onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              className={classes.styledTextFieldAutoComplete}
              {...params}
              type="string"
              variant="outlined"
              required={props.required}
              InputProps={{
                ...params.InputProps,
                type: "search",
                onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") event.preventDefault();
                },
              }}
              onChange={(event) => {
                setBeginWord(event.target.value);
                props.onChange(event.target.value);
              }}
            />
          )}
        />
      </Box>
    );
  }

  return <div>{StrAutoComplete(props)}</div>;
}

const exportMGIDApplyFieldTemplate = {
  FieldTemplateStr,
  FieldTemplateStrMultiline,
  FieldTemplateEnum,
  FieldTemplateStrAutoComplete,
  FieldTemplateNumber,
};

export default exportMGIDApplyFieldTemplate;
