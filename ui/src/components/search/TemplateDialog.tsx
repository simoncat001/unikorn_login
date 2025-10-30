import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Divider from "@material-ui/core/Divider";
import Common from "../../common/Common";
import { TemplateCardItem } from "./SearchDisplayComponent";
import {
  TemplateDialogProps,
  DiaglogItemValueList,
  OrderedListProps,
} from "../../common/SearchCardUtil";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import Button from "@material-ui/core/Button";
import { useState } from "react";
import { ListStateIcon } from "../Icon";
import ReviewStatusUtils from "../../common/ReviewStatusUtils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    templateDialogContainerControl: {
      paddingBottom: "40px",
    },
    templateGridItemControl: {
      height: "30px",
    },
    templateDiviControl: {
      marginBottom: "25px",
    },
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

export const TemplateDialog: React.FC<TemplateDialogProps> = ({ item }) => {
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
        <div className={fontClasses.CardEnglishName}>查看详情</div>
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        open={open}
        onClose={handleClose}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Box className={classes.close}>
            <Button className={classes.closebutton} onClick={handleClose}>
              <CloseRoundedIcon />
            </Button>
          </Box>
          <Container className={classes.templateDialogContainerControl}>
            <DialogTitle id="template-dialog-title">
              <GridList cols={12}>
                <GridListTile key={"标题"} cols={10} style={{ height: "70px" }}>
                  <Box display="flex" flexDirection="column">
                    <Box className={fontClasses.CardChineseName}>
                      {item.name}
                    </Box>
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
                </GridListTile>
                <GridListTile
                  key={"引用次数"}
                  cols={2}
                  style={{ height: "40px" }}
                >
                  <div className={fontClasses.CardBasicInfo}>
                    引用次数：{item.json_schema.citation_count}
                  </div>
                </GridListTile>
              </GridList>
            </DialogTitle>
            <DialogContent>
              <GridList cols={12}>
                <GridListTile
                  key={"基础信息"}
                  cols={12}
                  style={{ height: "40px" }}
                >
                  <div className={classes.templateGridItemControl}>
                    <div className={fontClasses.CardBasicInfo}>基础信息</div>
                    <Divider
                      absolute={true}
                      variant={"inset"}
                      className={classes.templateDiviControl}
                    />
                  </div>
                </GridListTile>
              </GridList>
            </DialogContent>
            <DialogContent>
              <Box
                display="flex"
                flexGrow={1}
                flexDirection="column"
                flexWrap="flex"
              >
                {DiaglogItemValueList.map((itemValue) => (
                  <TemplateCardItem
                    key={"templatedialog" + Math.random()}
                    itemJSON={item.json_schema}
                    itemValue={itemValue}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogContent>
              <GridList cols={12}>
                <GridListTile
                  key={"模板展示"}
                  cols={12}
                  style={{ height: "40px" }}
                >
                  <div className={classes.templateGridItemControl}>
                    <div className={fontClasses.CardBasicInfo}>模板展示</div>
                    <Divider
                      absolute={true}
                      variant={"inset"}
                      className={classes.templateDiviControl}
                    />
                  </div>
                </GridListTile>
              </GridList>
            </DialogContent>
            <DialogContent>
              <OrderedList wordOrder={item.json_schema.word_order!} layer={0} />
            </DialogContent>
          </Container>
        </Box>
      </Dialog>
    </Box>
  );
};

export const OrderedList: React.FC<OrderedListProps> = ({
  wordOrder,
  layer,
}) => {
  const fontClasses = Common.fontStyles();
  return (
    <div>
      {wordOrder.map((item, itemIndex) => {
        return item.type === "array" || item.type === "object" ? (
          <Box
            key={"wordOrder" + itemIndex}
            display="flex"
            flexWrap="wrap"
            flexDirection="row"
            m={0}
          >
            <Box display="flex" flexBasis="500px">
              <div
                className={fontClasses.unboldFont}
                style={{ marginLeft: 30 * layer }}
              >
                {layer === 0 ? (itemIndex + 1).toString() + ". " : ""}
                {item.title}
              </div>
            </Box>
            <OrderedList wordOrder={item.order} layer={layer + 1} />
          </Box>
        ) : (
          <Box
            key={"wordOrder" + itemIndex}
            display="flex"
            flexWrap="wrap"
            flexDirection="row"
            m={0}
          >
            <Box display="flex" flexBasis="500px">
              <div
                className={fontClasses.unboldFont}
                style={{ marginLeft: 30 * layer }}
              >
                {layer === 0 ? (itemIndex + 1).toString() + ". " : ""}
                {item.title}
              </div>
            </Box>
          </Box>
        );
      })}
    </div>
  );
};
