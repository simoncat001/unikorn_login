import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Card,
  CardContent,
  Collapse,
  CardActions,
  Typography,
} from "@material-ui/core";

import Common from "../../common/Common";
import Map from "../../common/Map";
import Icon from "../Icon";

const aColor = Common.allColor;

export const useStyles = makeStyles(() =>
  createStyles({
    expandBtn: {
      padding: "0px",
      "&:hover": {
        backgroundColor: "transparent",
      },
    },
  })
);

function cardBorderColor(itemType: string) {
  switch (itemType) {
    case "templates":
      return aColor.border;
    case "data":
      return aColor.lighterBorder;
  }
  return "transparent";
}

const PreviewCard: React.FC<{
  itemType: string;
  content: JSX.Element;
}> = ({ itemType, content }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      variant="outlined"
      style={{
        margin: "20px 0px",
        width: "688px",
        backgroundColor: aColor.accentBackground,
        borderColor: expanded ? cardBorderColor(itemType) : "transparent",
      }}
    >
      <CardActions disableSpacing>
        <CardContent style={{ padding: "2px 10px" }}>
          <Button
            className={classes.expandBtn}
            onClick={handleExpandClick}
            startIcon={
              expanded ? Icon.arrowDropDownIconSmall : Icon.arrowRightIconSmall
            }
            disableRipple
          >
            <Typography className={fontClasses.unboldFont}>
              {Map.itemTypeMap[itemType]}预览
            </Typography>
          </Button>
        </CardContent>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent
          style={{
            backgroundColor: "white",
            padding: itemType === "data" ? "0px" : "16px",
          }}
        >
          {content}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default PreviewCard;
