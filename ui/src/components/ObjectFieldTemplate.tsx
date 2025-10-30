import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ObjectFieldTemplateProps } from "@rjsf/core";
import { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import Common from "../common/Common";
import Utils from "../common/Utils";
import DesignComponent from "./DesignComponent";
import WordService from "../api/WordService";
import Map from "../common/Map";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    requiredField: {
      top: "25px",
      position: "relative",
      zIndex: 3,
    },
    templateDataTypeComponentTopLayerBox: {
      marginLeft: "74px",
      marginTop: "8px",
    },
    templateDataTypeComponentNotTopLayerBox: {
      marginLeft: "16px",
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
  })
);

const needUnitMap: { [key: string]: boolean } = {
  file: false,
  image: false,
  number: true,
  number_range: true,
  string: false,
  date: false,
  enum_text: false,
};

function getPropertiesName(
  props: ObjectFieldTemplateProps,
  elementType: string,
  ifArrayElement: boolean,
  notLastLayer: boolean
) {
  const offset = notLastLayer ? 0 : 1;
  return elementType === "single"
    ? ifArrayElement
      ? props.formData[props.properties[1 - offset].name]
      : props.formData[props.properties[2 - offset].name]
    : "";
}

function getPropertiesRequired(
  props: ObjectFieldTemplateProps,
  ifArrayElement: boolean,
  notLastLayer: boolean
) {
  const offset = notLastLayer ? 0 : 1;
  return ifArrayElement ? null : props.properties[1 - offset].content;
}

function getPropertiesContent(
  props: ObjectFieldTemplateProps,
  ifArrayElement: boolean,
  notLastLayer: boolean
) {
  const offset = notLastLayer ? 0 : 1;
  return ifArrayElement
    ? props.properties[1 - offset].content
    : props.properties[2 - offset].content;
}

function getPropertiesItems(
  props: ObjectFieldTemplateProps,
  ifArrayElement: boolean
) {
  return ifArrayElement
    ? props.properties[2].content
    : props.properties[3].content;
}

function ObjectFieldTemplateNotLastLayer(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  const cardClasses = Common.cardStyles();
  const typeLevel = props.properties[0].name;
  const elementType = props.formData[typeLevel];
  const notLastLayer = true;
  const currentLevel = Utils.getCurrentLevel(typeLevel);
  const ifArrayElement = Utils.ifArrayElement(props.idSchema.$id, currentLevel);
  /*
  we need to get the formData of the single word name.
  for single word, the property with index 2 represents its name.
  for the sub-layer of array, the required item does not exist,
  so the property with index 1 represents its name
  */
  const wordFormData = getPropertiesName(
    props,
    elementType,
    ifArrayElement,
    notLastLayer
  );
  const currentWordId = Utils.getId(wordFormData);
  const currentWordType = Utils.getType(wordFormData);
  const [unit, setUnit] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        if (elementType === "single" && needUnitMap[currentWordType] === true) {
          const unitGet: string = await WordService.getWordUnit(currentWordId);
          setUnit(unitGet);
        }
      } catch (e) {
        setUnit("");
        console.error(e);
      }
    })();
  }, [currentWordId, currentWordType, elementType]);
  const templateDataTypeComponent = DesignComponent.templateDataTypeComponent(
    currentWordType,
    unit
  );

  const elementTypeComponent = props.properties[0].content;
  /*
  elementType is "single"
  three cases:
  (1) single word in the sub-layer of array: do not have 'required' checkbox
  (2) single word in the rest layer (except last): do not need a card
  (3) single word in the top layer: need a card
  */
  if (elementType === "single") {
    const requiredComponent = getPropertiesRequired(
      props,
      ifArrayElement,
      notLastLayer
    );
    const wordNameComponent = getPropertiesContent(
      props,
      ifArrayElement,
      notLastLayer
    );
    if (ifArrayElement) {
      return (
        <Box marginTop="16px">
          {elementTypeComponent}
          <Box marginTop="8px">{wordNameComponent}</Box>
          <Box className={classes.templateDataTypeComponentNotTopLayerBox}>
            {templateDataTypeComponent}
          </Box>
        </Box>
      );
    }
    if (currentLevel !== 0) {
      return (
        <Box>
          {elementTypeComponent}
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            marginTop="8px"
          >
            <Box>{wordNameComponent}</Box>
            <Box>{requiredComponent}</Box>
          </Box>
          <Box className={classes.templateDataTypeComponentNotTopLayerBox}>
            {templateDataTypeComponent}
          </Box>
        </Box>
      );
    }
    return (
      <Box>
        {elementTypeComponent}
        <Card className={cardClasses.Primary} variant="outlined">
          <Box display="flex" flexDirection="row" alignItems="center">
            <Box>{wordNameComponent}</Box>
            <Box>{requiredComponent}</Box>
          </Box>
        </Card>
        <Box className={classes.templateDataTypeComponentTopLayerBox}>
          {templateDataTypeComponent}
        </Box>
      </Box>
    );
  }

  /*
  elementType is "object"
  two cases:
  (1) single word in the rest layer: do not need a card
  (2) single word in the top layer: need a card
  */
  if (elementType === "object") {
    const objectNameComponent = props.properties[1].content;
    const objectItemsComponent = props.properties[2].content;
    const marginTopLevel = ifArrayElement ? "16px" : "0px";
    if (currentLevel !== 0) {
      return (
        <Box marginTop={marginTopLevel}>
          {elementTypeComponent}
          <Box marginTop="8px">{objectNameComponent}</Box>

          {objectItemsComponent}
        </Box>
      );
    }
    return (
      <Box>
        {elementTypeComponent}
        <Card className={cardClasses.Primary} variant="outlined">
          {objectNameComponent}
        </Card>
        {objectItemsComponent}
      </Box>
    );
  }

  /*
  elementType is "array"
  two cases:
  (1) array in the sub-layer of array: do not have 'required' checkbox
  (2) array in the rest layer: do not need a card
  (3) array in the top layer: need a card
  */
  const requiredComponent = getPropertiesRequired(
    props,
    ifArrayElement,
    notLastLayer
  );
  const arrayNameComponent = getPropertiesContent(
    props,
    ifArrayElement,
    notLastLayer
  );
  const arrayItemsComponent = getPropertiesItems(props, ifArrayElement);
  if (ifArrayElement) {
    return (
      <Box marginTop="16px">
        {elementTypeComponent}
        <Box marginTop="8px">{arrayNameComponent}</Box>
        {arrayItemsComponent}
      </Box>
    );
  }
  if (currentLevel !== 0) {
    return (
      <Box>
        {elementTypeComponent}
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          marginTop="8px"
        >
          <Box>{arrayNameComponent}</Box>
          <Box>{requiredComponent}</Box>
        </Box>
        <Box>{arrayItemsComponent}</Box>
      </Box>
    );
  }
  return (
    <Box>
      {elementTypeComponent}
      <Card className={cardClasses.Primary} variant="outlined">
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box>{arrayNameComponent}</Box>
          <Box>{requiredComponent}</Box>
        </Box>
      </Card>
      <Box>{arrayItemsComponent}</Box>
    </Box>
  );
}

/*
in the last layer, element can only be single word, and there is no
selection for type.
This function is to deal with cases in the last layer
(1) single word in the sub-layer of array: do not have 'required' checkbox
(2) otherwise:  have 'required' checkbox and name textfield
*/
function ObjectFieldTemplateLastLayer(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  const typeLevel = props.properties[0].name;
  const currentLevel = Utils.getCurrentLevel(typeLevel);
  const ifArrayElement = Utils.ifArrayElement(props.idSchema.$id, currentLevel);
  const notLastLayer = false;
  const elementType = "single";
  const wordFormData = getPropertiesName(
    props,
    elementType,
    ifArrayElement,
    notLastLayer
  );
  const currentWordId = Utils.getId(wordFormData);
  const currentWordType = Utils.getType(wordFormData);
  const [unit, setUnit] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        if (needUnitMap[currentWordType] === true) {
          const unitGet: string = await WordService.getWordUnit(currentWordId);
          setUnit(unitGet);
        }
      } catch (e) {
        setUnit("");
        console.error(e);
      }
    })();
  }, [currentWordId, currentWordType]);

  const templateDataTypeComponent = DesignComponent.templateDataTypeComponent(
    currentWordType,
    unit
  );
  const wordNameComponent = getPropertiesContent(
    props,
    ifArrayElement,
    notLastLayer
  );
  const requiredComponent = getPropertiesRequired(
    props,
    ifArrayElement,
    notLastLayer
  );
  const enumList = ["single"];

  function lastLayerType() {
    return (
      <Box style={{ width: "110px" }}>
        <TextField
          className={classes.styledTextField}
          style={{ width: "110px" }}
          variant="outlined"
          select
          SelectProps={{ native: true }}
          value={"single"}
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

  if (ifArrayElement) {
    return (
      <Box marginTop="16px">
        {lastLayerType()}
        <Box marginTop="8px">{wordNameComponent}</Box>
        <Box className={classes.templateDataTypeComponentNotTopLayerBox}>
          {templateDataTypeComponent}
        </Box>
      </Box>
    );
  }
  return (
    <Box>
      {lastLayerType()}
      <Box
        display="flex"
        flexDirection="row"
        style={{ alignItems: "center" }}
        marginTop="8px"
      >
        <Box>{wordNameComponent}</Box>
        <Box>{requiredComponent}</Box>
      </Box>
      <Box className={classes.templateDataTypeComponentNotTopLayerBox}>
        {templateDataTypeComponent}
      </Box>
    </Box>
  );
}

const exportObjectFieldTemplate = {
  ObjectFieldTemplateNotLastLayer,
  ObjectFieldTemplateLastLayer,
};

export default exportObjectFieldTemplate;
