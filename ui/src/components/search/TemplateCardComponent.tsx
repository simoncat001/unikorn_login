import React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Box from "@material-ui/core/Box";
import Common from "../../common/Common";
import exportUtils from "../../common/Utils";
import { TemplateDialog } from "./TemplateDialog";
import {
  templateItemValueList,
  TemplateCardProps,
} from "../../common/SearchCardUtil";
import { TemplateCardItem } from "./SearchDisplayComponent";
import { ListStateIcon } from "../Icon";
import ReviewStatusUtils from "../../common/ReviewStatusUtils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardControl: {
      position: "relative",
      minHeight: "100px",
      marginBottom: "20px",
      width: "769px",
      "&:hover": {
        backgroundColor: Common.allColor.background,
        boxShadow: "0px 4px 13px rgba(0, 0, 0, 0.22)",
      },
    },
    details: {
      position: "relative",
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
    },
    chineseNameControl: {
      position: "relative",
      textAlign: "left",
      lineHeight: "20px",
    },
    englishNameControl: {
      position: "relative",
      textAlign: "left",
      lineHeight: "20px",
    },
    templateButtonControl: {
      width: "57px",
      height: "24px",
      marginTop: "10px",
      borderRadius: "100px",
      backgroundColor: Common.allColor.standardBlue,
    },
    templateWordControl: {
      color: Common.allColor.background,
    },
  })
);

export const TemplateCard: React.FC<TemplateCardProps> = ({
  item,
  query,
  loggedIn,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <div className={classes.details}>
      <Card className={classes.cardControl} variant="outlined">
        <CardHeader
          title={
            <Box display="flex" flexDirection="row">
              <Box className={classes.chineseNameControl}>
                <div className={fontClasses.CardChineseName}>
                  {exportUtils.keyWordHighLight(item.name, query)}
                </div>
              </Box>
              <Box marginLeft="20px">
                <Box display="flex" alignItems="center">
                  <ListStateIcon state={item.json_schema.review_status} />
                  <Typography className={fontClasses.unboldFont}>
                    {
                      ReviewStatusUtils.reviewStatusMap[
                        item.json_schema.review_status
                      ]
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          }
          action={
            <Button
              className={classes.templateButtonControl}
              variant="outlined"
              disabled
            >
              <div className={classes.templateWordControl}>模板</div>
            </Button>
          }
        />
        <CardContent>
          <Box display="flex" flexWrap="wrap" flexDirection="row" m={0}>
            {templateItemValueList.map((itemValue) => (
              <TemplateCardItem
                key={"templatecard" + Math.random()}
                itemJSON={item.json_schema}
                itemValue={itemValue}
              />
            ))}
          </Box>
        </CardContent>
        <Box display="flex" p={1} m={0} style={{ padding: 0 }}>
          <div style={{ width: 450 }}>
            <Box p={1} m={0} display="flex" flexDirection="row">
              <CardActions style={{ padding: 0 }}>
                {loggedIn ? <TemplateDialog item={item} /> : <div />}
              </CardActions>
            </Box>
          </div>
          <div style={{ width: 450 }}>
            <Box p={1} m={0} display="flex" flexDirection="row-reverse">
              <CardActions style={{ padding: 0 }}>
                <Button size="small" disabled>
                  <div className={fontClasses.CardMGID}>
                    {item.json_schema.template_MGID}
                  </div>
                </Button>
              </CardActions>
            </Box>
          </div>
        </Box>
      </Card>
    </div>
  );
};
