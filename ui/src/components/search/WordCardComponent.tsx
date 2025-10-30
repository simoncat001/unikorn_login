import { useState } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Common from "../../common/Common";
import exportUtils from "../../common/Utils";
import { WordCardProps, wordItemValueList } from "../../common/SearchCardUtil";
import { WordCardItem, CollapseItem } from "./SearchDisplayComponent";
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
    wordButtonControl: {
      width: "57px",
      height: "24px",
      marginTop: "10px",
      borderRadius: "100px",
      backgroundColor: Common.allColor.lightFill,
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
  })
);

export const WordCard: React.FC<WordCardProps> = ({
  item,
  query,
  loggedIn,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={classes.details}>
      <Card className={classes.cardControl} variant="outlined">
        <CardHeader
          title={
            <Box display="flex" flexDirection="row">
              <Box className={classes.chineseNameControl}>
                <div className={fontClasses.CardChineseName}>
                  {exportUtils.keyWordHighLight(
                    item.json_data.chinese_name,
                    query
                  )}
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
              className={classes.wordButtonControl}
              variant="outlined"
              disabled
            >
              词汇
            </Button>
          }
          subheader={
            <div className={classes.englishNameControl}>
              <div className={fontClasses.CardEnglishName}>
                {item.json_data.english_name}
              </div>
            </div>
          }
        />
        <CardContent>
          <Box display="flex" flexWrap="wrap" flexDirection="row" m={0}>
            {wordItemValueList.map((itemValue) => (
              <WordCardItem
                key={"templatecard" + Math.random()}
                itemJSON={item.json_data}
                itemValue={itemValue}
              />
            ))}
            {item.json_data.data_type === "number" ||
            item.json_data.data_type === "number_range" ? (
              <WordCardItem
                key={"templatecard" + item.json_data.create_timestamp}
                itemJSON={item.json_data}
                itemValue={"unit"}
              />
            ) : null}
          </Box>
        </CardContent>
        <CardActions>
          {exportUtils.getWordElemValue(item.json_data, "data_type") ===
          "enum_text" ? (
            loggedIn ? (
              <Button
                key={"buttonList"}
                onClick={handleExpandClick}
                size="small"
              >
                <div className={fontClasses.CardEnglishName}>
                  {expanded ? "收起" : "展开全文"}
                </div>
              </Button>
            ) : (
              <div />
            )
          ) : null}
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {exportUtils.getWordElemValue(item.json_data, "data_type") ===
            "enum_text" ? (
              <CollapseItem
                optionTitle={"options"}
                optionList={item.json_data.options!}
              />
            ) : null}
          </CardContent>
        </Collapse>
      </Card>
    </div>
  );
};
