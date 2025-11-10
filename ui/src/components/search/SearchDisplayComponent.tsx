import React from "react";
import Box from "@material-ui/core/Box";
import { Button } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import FilterNoneIcon from "@material-ui/icons/FilterNone";
import Map from "../../common/Map";
import Common from "../../common/Common";
import exportUtils from "../../common/Utils";
import {
  WordCardItemProps,
  TemplateCardItemProps,
  CollapseItemProps,
  DataCardItemProps,
  CitationCardProps,
  MGIDCardItemProps,
} from "../../common/SearchCardUtil";

export const WordCardItem: React.FC<WordCardItemProps> = ({
  itemJSON,
  itemValue,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" width="360px">
      <Box display="flex" flexBasis="100px" minWidth="100px">
        <div className={fontClasses.boldFont}>{Map.wordItemMap[itemValue]}</div>
      </Box>
      <Box display="flex" flexBasis="260px" minWidth="100px" flexWrap="wrap">
        <div
          className={fontClasses.unboldFont}
          style={{ textAlign: "left", wordBreak: "break-all" }}
        >
          {itemValue === "data_type"
            ? Map.dataTypeMap[exportUtils.getWordElemValue(itemJSON, itemValue)]
            : exportUtils.getWordElemValue(itemJSON, itemValue)}
        </div>
      </Box>
    </Box>
  );
};

export const TemplateCardItem: React.FC<TemplateCardItemProps> = ({
  itemJSON,
  itemValue,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" width="360px">
      <Box display="flex">
        <Box display="flex" flexBasis="100px" minWidth="100px">
          <div className={fontClasses.boldFont}>
            {Map.templateItemMap[itemValue]}
          </div>
        </Box>
        <Box display="flex" flexBasis="260px" minWidth="100px" flexWrap="wrap">
          <div
            className={fontClasses.unboldFont}
            style={{ textAlign: "left", wordBreak: "break-all" }}
          >
            {itemValue === "data_generate_method"
              ? Map.dataGenerateMethodMap[itemJSON.data_generate_method]
              : itemValue === "template_type"
              ? Map.templateTypeMap[itemJSON.template_type]
              : exportUtils.getTemplateElemValue(itemJSON, itemValue)}
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export const CollapseItem: React.FC<CollapseItemProps> = ({
  optionTitle,
  optionList,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" flexWrap="flex">
      <Box display="flex">
        <Box display="flex" flexBasis="100px" minWidth="100px">
          <div className={fontClasses.boldFont}>
            {Map.wordItemMap[optionTitle]}
          </div>
        </Box>
        <Box display="flex" flexBasis="260px" minWidth="100px">
          <div className={fontClasses.unboldFont} style={{ textAlign: "left" }}>
            {optionList.map((itemValue, itemIndex) => (
              <div
                key={"option" + Math.random()}
                className={fontClasses.unboldFont}
                style={{ textAlign: "left" }}
              >
                {itemIndex + 1}. {itemValue}
              </div>
            ))}
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export const DataCardItem: React.FC<DataCardItemProps> = ({
  itemJSON,
  itemValue,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" width="360px">
      <Box display="flex" flexBasis="100px" minWidth="100px">
        <div className={fontClasses.boldFont}>
          {Map.developmentDataItemMap[itemValue]}
        </div>
      </Box>
      <Box display="flex" width="260px" flexWrap="wrap">
        <div
          className={fontClasses.unboldFont}
          style={{ textAlign: "left", wordBreak: "break-all" }}
        >
          {itemValue === "data_generate_method"
            ? Map.dataGenerateMethodMap[
                exportUtils.getDataElemValue(itemJSON, itemValue)
              ]
            : itemValue === "template_type"
            ? Map.templateTypeMap[
                exportUtils.getDataElemValue(itemJSON, itemValue)
              ]
            : exportUtils.getDataElemValue(itemJSON, itemValue)}
        </div>
      </Box>
    </Box>
  );
};

export const CitationCard: React.FC<CitationCardProps> = ({
  citationString,
}) => {
  const fontClasses = Common.fontStyles();
  const [open, setOpen] = React.useState(false);

  const clickToCopy = () => {
    navigator.clipboard.writeText(citationString);
    setOpen(true);
  };

  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="column"
      style={{ backgroundColor: Common.allColor.accentBackground }}
    >
      <Box
        display="flex"
        flexGrow={1}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box display="flex" flexBasis="100px">
          <div className={fontClasses.boldFont}>引用格式:</div>
        </Box>
        <Box display="flex">
          <Button onClick={clickToCopy}>
            <FilterNoneIcon style={{ fontSize: "14px" }} />
          </Button>
        </Box>
      </Box>
      <Box display="flex" flexGrow={1} flexWrap="wrap">
        <div className={fontClasses.unboldFont}>{citationString}</div>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          已粘贴到剪切板
        </Alert>
      </Snackbar>
    </Box>
  );
};

export const MGIDCardItem: React.FC<MGIDCardItemProps> = ({
  itemJSON,
  itemValue,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" width="360px">
      <Box display="flex" flexBasis="100px" minWidth="100px">
        <div className={fontClasses.boldFont}>{Map.MGIDItemMap[itemValue]}</div>
      </Box>
      <Box display="flex" width="260px" flexWrap="wrap">
        <div
          className={fontClasses.unboldFont}
          style={{ textAlign: "left", wordBreak: "break-all" }}
        >
          {exportUtils.getMGIDElemValue(itemJSON, itemValue)}
        </div>
      </Box>
    </Box>
  );
};

export const MGIDCollapseItem: React.FC<CollapseItemProps> = ({
  optionTitle,
  optionList,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" flexWrap="flex">
      <Box display="flex">
        <Box display="flex" flexBasis="100px" minWidth="100px">
          <div className={fontClasses.boldFont}>
            {Map.wordItemMap[optionTitle]}
          </div>
        </Box>
        <Box display="flex" flexBasis="260px" minWidth="100px">
          <div className={fontClasses.unboldFont} style={{ textAlign: "left" }}>
            {optionList.map((itemValue, itemIndex) => (
              <div
                key={"option" + Math.random()}
                className={fontClasses.unboldFont}
                style={{ textAlign: "left" }}
              >
                {itemIndex + 1}. {itemValue}
              </div>
            ))}
          </div>
        </Box>
      </Box>
    </Box>
  );
};
