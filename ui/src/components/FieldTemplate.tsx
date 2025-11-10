import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import { useState, useEffect } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import WordService, { WordNameData } from "../api/WordService";
import Utils from "../common/Utils";
import Common from "../common/Common";
import Map from "../common/Map";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    templateBox: {
      width: "140px",
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
    styledTextFieldAutoComplete: {
      width: "268px",
      padding: "0px",
      marginLeft: "16px",
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
    styledTextFieldName: {
      width: "268px",
      padding: "0px",
      "& .MuiInputBase-root": {
        padding: "6px",
      },
      "& .MuiOutlinedInput-input": {
        padding: "4.5px 4px 4.5px 6px",
      },
    },
    styledUserTextField: {
      width: "262px",
      padding: "0px",
      boxSizing: "border-box",
      borderRadius: "2px",
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
    alignLeftTitle: {
      marginTop: "4px",
      marginLeft: "16px",
      color: aColor.bodyText,
      float: "left",
    },
    requiredIcon: {
      color: aColor.requiredRed,
    },
    styledAlignLeftStrContainer: {
      width: "418px",
      height: "24px",
    },
    styledUserRadioRow: {
      width: "418px",
      height: "30px",
      alignItems: "center",
    },
    styledUserRadioRowLabel: {
      color: "black",
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
        <span className={classes.requiredIcon}>
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
    <Box style={{ width: "600px" }}>
      {FieldTemplateTitle(props)}
      <TextField
        className={classes.styledTextField}
        required={props.required}
        type="string"
        variant="outlined"
        value={
          props.schema.default === "" || props.schema.default === undefined
            ? props.formData !== undefined
              ? props.formData
              : ""
            : props.schema.default
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

function FieldTemplateStrCustomField(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box width="600px">
      {FieldTemplateTitle(props)}
      <TextField
        size="small"
        className={[classes.styledTextField, classes.NoSpinArrow].join(" ")}
        required={props.required}
        type="number"
        variant="outlined"
        label="填入四位数字"
        value={props.formData !== undefined ? props.formData : ""}
        onChange={(event) => props.onChange(event.target.value)}
        InputProps={{
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") event.preventDefault();
          },
        }}
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

function FieldTemplateEnumRadioRow(props: FieldTemplateProps) {
  const radioClasses = Common.radioStyles();
  const fontClasses = Common.fontStyles();
  const title = props.schema.title !== undefined ? props.schema.title : "";
  const enumList = getEnumList(props);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };
  return (
    <Box
      display="flex"
      flexDirection="row"
      style={{ width: "600px", alignItems: "center" }}
    >
      {FieldTemplateTitle(props)}
      <Box>
        <RadioGroup row value={props.formData} onChange={handleChange}>
          {enumList.map((option: string, index: number) => (
            <FormControlLabel
              key={index}
              value={enumList[index]}
              control={
                <Radio color="default" className={radioClasses.Primary} />
              }
              label={
                <Typography className={fontClasses.unboldFont}>
                  {Map.enumType[title][option]}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </Box>
    </Box>
  );
}

function FieldTemplateEnumRadioColumn(props: FieldTemplateProps) {
  const radioClasses = Common.radioStyles();
  const fontClasses = Common.fontStyles();
  const title = props.schema.title !== undefined ? props.schema.title : "";
  const enumList = getEnumList(props);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };
  return (
    <Box flexDirection="row" style={{ width: "600px" }}>
      {FieldTemplateTitle(props)}
      <Box style={{ bottom: "5px", position: "relative" }}>
        <RadioGroup value={props.formData} onChange={handleChange}>
          {enumList.map((option: string, index: number) => (
            <FormControlLabel
              key={index}
              value={enumList[index]}
              control={
                <Radio color="default" className={radioClasses.Primary} />
              }
              label={
                <Typography className={fontClasses.unboldFont}>
                  {Map.enumType[title][option]}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </Box>
    </Box>
  );
}

//TODO:fix autocomplete onChange
const StrAutoComplete: React.FC<{
  props: FieldTemplateProps;
  marginLevel: string;
}> = ({ props, marginLevel }) => {
  const classes = useStyles();
  const boxClasses = Common.boxStyles();
  const fontClasses = Common.fontStyles();
  const [beginWord, setBeginWord] = useState("");
  const [wordNameList, setWordNameList] = useState<string[]>([]);
  const [wordNameDict, setWordNameDict] = useState<{
    [key: string]: string[];
  }>({});

  useEffect(() => {
    void (async () => {
      try {
        if (beginWord !== "" && beginWord.indexOf("'") === -1) {
          const wordList: WordNameData = await WordService.getWordListWithBegin(
            beginWord
          );
          setWordNameList(wordList.name_list);
          setWordNameDict(wordList.name_dict);
        }
      } catch (e) {
        setWordNameList([]);
        console.error(e);
      }
    })();
  }, [beginWord]);

  const currentType =
    Utils.getType(props.formData) !== ""
      ? Utils.getType(props.formData)
      : beginWord in wordNameDict
      ? wordNameDict[beginWord][0]
      : "";
  return (
    <Box display="flex" flexDirection="row" alignItems="center" height="74px">
      <Box
        className={boxClasses.PrimaryTemplateCreate}
        marginLeft={marginLevel}
      >
        <Typography className={fontClasses.unboldFontWhite}>
          {Map.dataTypeMap[currentType]}
        </Typography>
      </Box>
      <Autocomplete
        size="small"
        freeSolo
        disableClearable
        value={Utils.getName(props.formData)}
        options={wordNameList.map((option) => option)}
        onChange={(event, newValue: string) => {
          const newFormData =
            newValue in wordNameDict
              ? newValue +
                ":" +
                wordNameDict[newValue][0] +
                ":" +
                wordNameDict[newValue][1]
              : newValue;
          props.onChange(newFormData);
        }}
        renderInput={(params) => (
          <TextField
            className={classes.styledTextFieldAutoComplete}
            {...params}
            error={Utils.validateSingleWord(props.formData)}
            type="string"
            variant="outlined"
            label="输入词汇名称"
            required={props.required}
            value={beginWord}
            InputProps={{
              ...params.InputProps,
              type: "search",
              onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") event.preventDefault();
              },
            }}
            onBlur={(event) => {
              props.onChange(
                event.target.value in wordNameDict
                  ? event.target.value +
                      ":" +
                      wordNameDict[event.target.value][0] +
                      ":" +
                      wordNameDict[event.target.value][1]
                  : event.target.value
              );
            }}
            onChange={(event) => {
              setBeginWord(
                event.target.value !== undefined ? event.target.value : ""
              );
              props.onChange(event.target.value);
            }}
          />
        )}
      />
    </Box>
  );
};

function FieldTemplateStrAutoComplete(
  props: { level: number } & FieldTemplateProps
) {
  if (Utils.getCurrentLevel(props.id) === 0) {
    return <StrAutoComplete props={props} marginLevel={"58px"} />;
  }
  return <StrAutoComplete props={props} marginLevel={"0px"} />;
}

function FieldTemplateArray(props: FieldTemplateProps) {
  const marginLevel = Utils.getMarginLevel(props.label);
  return (
    <Box style={{ width: "712px", marginLeft: marginLevel }}>
      {props.children}
    </Box>
  );
}

function FieldTemplateName(props: FieldTemplateProps) {
  const classes = useStyles();
  const boxClasses = Common.boxStyles();
  const fontClasses = Common.fontStyles();
  const currentLevel = Utils.getCurrentLevel(props.id);
  const bgColor = currentLevel === 0 ? aColor.accentBackground : "white";
  const marginLevel = currentLevel === 0 ? "58px" : "0px";

  function ArrayObjectName(props: FieldTemplateProps) {
    return (
      <Box display="flex" flexDirection="row" alignItems="center" height="74px">
        <Box
          className={boxClasses.PrimaryTemplateCreate}
          style={{ marginLeft: marginLevel }}
        >
          <Typography className={fontClasses.unboldFontWhite}>
            {Utils.judgeArray(props.id) ? "数组" : "对象"}
          </Typography>
        </Box>
        <Box
          className={boxClasses.SecondTemplateCreate}
          style={{ backgroundColor: bgColor }}
        >
          <TextField
            size="small"
            className={classes.styledTextFieldName}
            style={{ backgroundColor: bgColor }}
            required={props.required}
            type="string"
            variant="outlined"
            label={Utils.judgeArray(props.id) ? "输入数组名称" : "输入对象名称"}
            value={
              props.schema.default === ""
                ? props.formData
                : props.schema.default
            }
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

  return <Box>{ArrayObjectName(props)}</Box>;
}

function FieldTemplateType(props: FieldTemplateProps) {
  const classes = useStyles();
  const enumListOrigin =
    props.schema.enum !== undefined ? props.schema.enum : [];
  var enumList: string[] = [];

  for (var i = 0; i < enumListOrigin.length; i++) {
    enumList.push(enumListOrigin[i] as string);
  }

  return (
    <Box style={{ width: "110px" }}>
      <TextField
        className={classes.styledTextField}
        style={{ width: "110px" }}
        variant="outlined"
        select
        SelectProps={{ native: true }}
        value={props.formData}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {enumList.map((option: string, index: number) => (
          <option key={index} value={enumList[index]}>
            {Map.templateDataType[option]}
          </option>
        ))}
      </TextField>
    </Box>
  );
}

function FieldTemplateCheckbox(props: FieldTemplateProps) {
  const title = props.schema.title !== undefined ? props.schema.title : "";
  const defaultValue: boolean =
    props.formData !== undefined ? (props.formData as boolean) : true;
  const fontClasses = Common.fontStyles();
  const checkboxClasses = Common.checkboxStyles();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.checked);
  };

  return (
    <FormControlLabel
      style={{ marginLeft: "30px" }}
      control={
        <Checkbox
          className={checkboxClasses.Primary}
          checked={defaultValue}
          onChange={handleChange}
          color="default"
        />
      }
      label={
        <Typography className={fontClasses.unboldFont}>{title}</Typography>
      }
    />
  );
}

function FieldTemplateAlignLeftTitle(props: FieldTemplateProps) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box className={classes.templateBox}>
      <Typography
        align="right"
        className={[fontClasses.boldFont, classes.alignLeftTitle].join(" ")}
      >
        <span className={classes.requiredIcon}>
          {props.required ? "*" : ""}
        </span>
        {props.schema.title}：
      </Typography>
    </Box>
  );
}

function FieldTemplateAlignLeftStr(props: FieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box display="flex" className={classes.styledAlignLeftStrContainer}>
      <Box display="flex">{FieldTemplateAlignLeftTitle(props)}</Box>
      <Box display="flex">
        <TextField
          className={classes.styledUserTextField}
          required={props.required}
          type="string"
          variant="outlined"
          value={
            props.schema.default === "" ? props.formData : props.schema.default
          }
          onChange={(event) => props.onChange(event.target.value)}
          InputProps={{
            onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") event.preventDefault();
            },
          }}
        />
      </Box>
    </Box>
  );
}

function FieldTemplateUserEnumRadioRow(props: FieldTemplateProps) {
  const classes = useStyles();
  const radioClasses = Common.radioStyles();
  const fontClasses = Common.fontStyles();
  const enumList = getEnumList(props);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };
  return (
    <Box
      display="flex"
      flexDirection="row"
      className={classes.styledUserRadioRow}
    >
      {FieldTemplateAlignLeftTitle(props)}
      <Box>
        <RadioGroup row value={props.formData} onChange={handleChange}>
          {enumList.map((option: string, index: number) => (
            <FormControlLabel
              key={index}
              value={enumList[index]}
              control={
                <Radio color="default" className={radioClasses.Primary} />
              }
              label={
                <Typography
                  className={[
                    fontClasses.unboldFont,
                    classes.styledUserRadioRowLabel,
                  ].join(" ")}
                >
                  {Map.UserAdminOption[option]}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
      </Box>
    </Box>
  );
}

const exportFieldTemplate = {
  FieldTemplateStr,
  FieldTemplateStrCustomField,
  FieldTemplateStrAutoComplete,
  FieldTemplateEnum,
  FieldTemplateEnumRadioRow,
  FieldTemplateEnumRadioColumn,
  FieldTemplateArray,
  FieldTemplateName,
  FieldTemplateType,
  FieldTemplateCheckbox,
  FieldTemplateAlignLeftStr,
  FieldTemplateUserEnumRadioRow,
};

export default exportFieldTemplate;
