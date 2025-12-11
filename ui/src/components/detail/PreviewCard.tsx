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
  onEditClick?: () => void;
  showEditButton?: boolean;
}> = ({ itemType, content, onEditClick, showEditButton = false }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const btnClasses = Common.buttonStyles();
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
        {showEditButton && expanded && (
          <CardActions style={{ justifyContent: "flex-end", padding: "8px 16px" }}>
            <Button
              className={btnClasses.SecondarySmallIcon}
              startIcon={Icon.editIcon}
              disableRipple
              onClick={onEditClick}
            >
              编辑
            </Button>
          </CardActions>
        )}
      </Collapse>
    </Card>
  );
};

export default PreviewCard;
