import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Common from "../../common/Common";
import { DataCardItem, CitationCard } from "./SearchDisplayComponent";
import {
  DataDialogProps,
  dataItemValueList,
} from "../../common/SearchCardUtil";
import { AdminDivider } from "../admin/AdminDisplayUtil";
import ContentObject from "../DevelopmentDataContent";
import exportUtils from "../../common/Utils";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import Button from "@material-ui/core/Button";
import { useState } from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { ListStateIcon } from "../Icon";
import ReviewStatusUtils from "../../common/ReviewStatusUtils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    close: {
      marginTop: "16px",
      marginBottom: "0px",
    },
    closebutton: {
      height: "10px",
      width: "10px",
      minWidth: "10px",
      marginRight: "16px",
    },
  })
);

export const DataDialog: React.FC<DataDialogProps> = ({ item }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Button onClick={handleClickOpen} size="small">
        <div className={fontClasses.CardEnglishName}>展开全文</div>
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"md"}
        open={open}
        onClose={handleClose}
      >
        <Box display="flex" flexDirection="column">
          <Box className={classes.close}>
            <Box display="flex" flexDirection="row" justifyContent="flex-end">
              <Button className={classes.closebutton} onClick={handleClose}>
                <CloseRoundedIcon />
              </Button>
            </Box>
          </Box>
          <Box>
            <DialogTitle>
              <Box display="flex" flexDirection="column" maxWidth="700px" m={2}>
                <Box className={fontClasses.CardChineseName}>
                  {item.json_data.title}
                </Box>
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
            </DialogTitle>
            <DialogContent>
              <AdminDivider value="基本信息" />
              <Box
                display="flex"
                flexGrow={1}
                flexDirection="column"
                flexWrap="flex"
                maxWidth="700px"
                m={2}
              >
                {dataItemValueList.map((value, itemIndex) => {
                  return (
                    <DataCardItem
                      key={"value" + itemIndex}
                      itemJSON={item.json_data}
                      itemValue={value}
                    />
                  );
                })}
              </Box>
              <AdminDivider value="数据展示" />
              <Box display="flex" maxWidth="700px" m={2}>
                <ContentObject content={item.json_data.data_content} />
              </Box>
              <Box display="flex" maxWidth="700px" m={2}>
                <CitationCard
                  citationString={exportUtils.getCitation(item.json_data)}
                />
              </Box>
            </DialogContent>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};
