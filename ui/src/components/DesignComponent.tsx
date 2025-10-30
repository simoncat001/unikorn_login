import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Common from "../common/Common";
import Map from "../common/Map";

function templateItem(dataType: string, dataName: string) {
  const boxClasses = Common.boxStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row">
      <Box className={boxClasses.PrimaryTemplateCreate}>
        <Typography className={fontClasses.unboldFontWhite}>
          {Map.dataTypeMap[dataType]}
        </Typography>
      </Box>
      <Box className={boxClasses.SecondTemplateCreate}>
        <Typography className={fontClasses.unboldFont}>{dataName}</Typography>
      </Box>
    </Box>
  );
}

function templateDataTypeComponent(dataType: string, unit: string) {
  const boxClasses = Common.boxStyles();
  const fontClasses = Common.fontStyles();
  enum dataTypeEnum {
    fileBox,
    numberBox,
    numberRangeBox,
    textBox,
  }
  const dataTypeMap: { [key: string]: dataTypeEnum } = {
    file: dataTypeEnum.fileBox,
    image: dataTypeEnum.fileBox,
    number: dataTypeEnum.numberBox,
    number_range: dataTypeEnum.numberRangeBox,
    string: dataTypeEnum.textBox,
    date: dataTypeEnum.textBox,
    enum_text: dataTypeEnum.textBox,
    MGID: dataTypeEnum.textBox,
  };
  if (dataTypeMap[dataType] === dataTypeEnum.fileBox) {
    return (
      <Box display="flex" flexDirection="row">
        <Box className={boxClasses.File}></Box>
      </Box>
    );
  }
  if (dataTypeMap[dataType] === dataTypeEnum.numberBox) {
    return (
      <Box display="flex" flexDirection="row">
        <Box className={boxClasses.Text}></Box>
        <Box style={{ marginLeft: "7px" }}>
          <Typography className={fontClasses.unboldFont}>{unit}</Typography>
        </Box>
      </Box>
    );
  }
  if (dataTypeMap[dataType] === dataTypeEnum.numberRangeBox) {
    return (
      <Box display="flex" flexDirection="row">
        <Box className={boxClasses.NumberRangeStart}></Box>
        <Box style={{ marginLeft: "12px" }}>
          <Typography className={fontClasses.unboldFont}>~</Typography>
        </Box>
        <Box className={boxClasses.NumberRangeEnd}></Box>
        <Box style={{ marginLeft: "7px" }}>
          <Typography className={fontClasses.unboldFont}>{unit}</Typography>
        </Box>
      </Box>
    );
  }
  if (dataTypeMap[dataType] === dataTypeEnum.textBox) {
    return <Box className={boxClasses.Text}></Box>;
  }
  return;
}

const exportDesginComponent = {
  templateItem,
  templateDataTypeComponent,
};

export default exportDesginComponent;
