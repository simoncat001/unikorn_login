import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Utils from "../../common/Utils";
import DesignComponent from "../DesignComponent";

import Common from "../../common/Common";
import { Box, Card } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    laststep: {
      display: "flex",
      marginTop: "54px",
    },
  })
);

const TemplateCreatePresetWord: React.FC<{
  presetWordList: {
    [key: string]: string[];
  };
  basicInformationData: any;
}> = ({ presetWordList, basicInformationData }) => {
  const classes = useStyles();
  const cardClasses = Common.cardStyles();
  const templateType: string = basicInformationData["template_type"];
  const templatePresetWord = presetWordList[templateType];
  return (
    <Box flexDirection="column" className={classes.laststep}>
      {templatePresetWord.map((word, index) => (
        <Card className={cardClasses.Primary} variant="outlined" key={index}>
          <Box style={{ marginLeft: "58px", marginTop: "24px" }}>
            {DesignComponent.templateItem(
              Utils.getType(word),
              Utils.getName(word)
            )}
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default TemplateCreatePresetWord;
