import React, { useState } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Map from "../../common/Map";
import Common from "../../common/Common";
import exportUtils from "../../common/Utils";
import { MGIDCardProps, MGIDItemValueList } from "../../common/SearchCardUtil";
import { MGIDCardItem } from "./SearchDisplayComponent";
import { Collapse, Link } from "@material-ui/core";
import { getClickableLink } from "../MGIDDetailComponent";

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
      backgroundColor: Common.allColor.tagMGID,
    },
    chineseNameControl: {
      position: "relative",
      textAlign: "left",
      lineHeight: "20px",
    },
    data_url: {
      color: Common.allColor.primaryColor,
      textDecoration: "underline",
    },
  })
);

export const MGIDCard: React.FC<MGIDCardProps> = ({
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
    <Box display="flex" flexDirection="column" alignItems="center">
      <Card className={classes.cardControl}>
        <CardHeader
          title={
            <div className={classes.chineseNameControl}>
              <div className={fontClasses.CardChineseName}>
                {item.json_data.data_title}
              </div>
            </div>
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
              MGID号
            </Button>
          }
        />
        <CardContent>
          <Box display="flex" flexWrap="wrap" flexDirection="row" m={0}>
            {MGIDItemValueList.map((itemValue) => (
              <MGIDCardItem
                key={"MGIDcard" + Math.random()}
                itemJSON={item.json_data}
                itemValue={itemValue}
              />
            ))}
          </Box>
        </CardContent>
        <CardActions>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            flexGrow={1}
          >
            <Box display="flex">
              {loggedIn ? (
                <Button onClick={handleExpandClick} size="small">
                  <div className={fontClasses.CardEnglishName}>
                    {expanded ? "收起" : "展开全文"}
                  </div>
                </Button>
              ) : (
                <div />
              )}
            </Box>
            <Box display="flex" flexDirection="column" justifyContent="center">
              <Link
                className={classes.data_url}
                classes={{ root: fontClasses.unboldFont }}
                href={getClickableLink(item.json_data.data_url)}
              >
                数据链接地址
              </Link>
            </Box>
          </Box>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Box display="flex" flexDirection="row">
              <Box display="flex" flexBasis="100px" minWidth="100px">
                <div className={fontClasses.boldFont}>
                  {Map.MGIDItemMap["abstract"]}
                </div>
              </Box>
              <Box display="flex" flexWrap="wrap">
                <div
                  className={fontClasses.unboldFont}
                  style={{ textAlign: "left", wordBreak: "break-all" }}
                >
                  {exportUtils.getMGIDElemValue(item.json_data, "abstract")}
                </div>
              </Box>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );
};
