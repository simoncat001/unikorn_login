import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Box, Typography, Drawer } from "@material-ui/core/";

import Utils from "../common/Utils";
import OverallTreeView, { RenderTree } from "./OverallTreeView";
import Common from "../common/Common";
import { parseCreateData } from "../common/Utils";

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
  createStyles({
    drawer: {
      width: 260,
      flexShrink: 0,
    },
    drawerPaper: {
      marginTop: "60px",
      width: 260,
    },
    primaryBlock: {
      height: "19px",
      width: "6px",
      backgroundColor: aColor.primaryColor,
      marginLeft: "24px",
      marginRight: "12px",
    },
  })
);

const TemplateTreeView: React.FC<{
  presetWordList: {
    [key: string]: string[];
  };
  basicInformationData: any;
  templateCreateData: any;
}> = ({ presetWordList, basicInformationData, templateCreateData }) => {
  const fontClasses = Common.fontStyles();
  const classes = useStyles();

  let treeData: RenderTree[] = [];

  const templateType: string = basicInformationData["template_type"];
  const templatePresetWord = presetWordList[templateType];

  templatePresetWord.map((word) =>
    treeData.push({ name: Utils.getName(word) })
  );

  if (templateCreateData && templateCreateData["level0"]) {
    for (var idx in templateCreateData["level0"]) {
      const formDataItem = templateCreateData["level0"][idx];
      treeData.push(parseCreateData(formDataItem, 0));
    }
  }

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        style={{ marginTop: "40px" }}
      >
        <Box display="flex" style={{ alignItems: "center" }}>
          <div className={classes.primaryBlock} />
          <Typography className={fontClasses.LastNextStep}>模板大纲</Typography>
        </Box>
        <Box display="flex" style={{ marginTop: "24px", marginLeft: "45px" }}>
          <OverallTreeView TreeData={treeData} />
        </Box>
      </Box>
    </Drawer>
  );
};

export default TemplateTreeView;
