import React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Common from "../../common/Common";
import exportUtils from "../../common/Utils";
import { DataCardProps, dataItemValueList } from "../../common/SearchCardUtil";
import { DataCardItem } from "./SearchDisplayComponent";
import { DataDialog } from "./DataCardDialog";
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
    dataButtonControl: {
      width: "92px",
      height: "24px",
      marginTop: "10px",
      borderRadius: "100px",
      backgroundColor: Common.allColor.primaryGreen,
    },
    chineseNameControl: {
      position: "relative",
      textAlign: "left",
      lineHeight: "20px",
    },
  })
);

export const DataCard: React.FC<DataCardProps> = ({
  item,
  query,
  loggedIn,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Card className={classes.cardControl}>
        <CardHeader
          title={
            <Box display="flex" flexDirection="row">
              <Box className={classes.chineseNameControl}>
                <div className={fontClasses.CardChineseName}>
                  {exportUtils.keyWordHighLight(item.json_data.title, query)}
                </div>
              </Box>
              <Box marginLeft="20px">
                <Box display="flex" alignItems="center">
                  <ListStateIcon state={item.json_data.review_status} />
                  <Typography className={fontClasses.unboldFont}>
                    {
                      ReviewStatusUtils.reviewStatusMap[
                        item.json_data.review_status
                      ]
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          }
          action={
            <Button
              className={classes.dataButtonControl}
              classes={{
                label: fontClasses.ButtonFont,
              }}
              variant="outlined"
              disabled
            >
              研发数据
            </Button>
          }
        />
        <CardContent>
          <Box display="flex" flexWrap="wrap" flexDirection="row" m={0}>
            {dataItemValueList.map((itemValue) => (
              <DataCardItem
                key={"datacard" + Math.random()}
                itemJSON={item.json_data}
                itemValue={itemValue}
              />
            ))}
          </Box>
        </CardContent>
        <CardActions>
          {loggedIn ? <DataDialog item={item} /> : <div />}
        </CardActions>
      </Card>
    </Box>
  );
};
