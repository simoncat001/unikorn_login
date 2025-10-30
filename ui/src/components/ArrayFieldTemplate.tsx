import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ArrayFieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Common from "../common/Common";
import Utils from "../common/Utils";
import Icon from "./Icon";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import { InputAdornment } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    templateBox: {
      width: "140px",
      float: "left",
      marginRight: "13px",
    },
    styledTextField: {
      width: "430px",
      padding: "0px",
      "& .MuiInputBase-root": {
        height: "32px",
        padding: "0px",
        backgroundColor: "white",
      },
      "& .MuiOutlinedInput-input": {
        height: "32px",
        padding: "0px 11px",
        backgroundColor: "white",
      },
    },
    boxControl: {
      width: "430px",
    },
    IconButtonControl: {
      height: "16px",
      padding: "0px",
    },
  })
);

function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box width="600px" display="flex" flexDirection="row">
      <Box className={classes.templateBox}>
        <Typography
          align="right"
          style={{ marginTop: "4px" }}
          className={fontClasses.boldFont}
        >
          <span style={{ color: aColor.requiredRed }}>
            {props.required ? "*" : ""}
          </span>
          {props.schema.title}：
        </Typography>
      </Box>
      <Box>
        <AddItem props={props} />
      </Box>
    </Box>
  );
}

type AddItemProps = {
  props: ArrayFieldTemplateProps;
};

const AddItem: React.FC<AddItemProps> = ({ props }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const buttonClasses = Common.buttonStyles();
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex">
        {props.canAdd && (
          <Button
            className={buttonClasses.SecondarySmallIcon}
            disabled={props.canAdd ? false : true}
            startIcon={<AddIcon />}
            onClick={() => {
              props.onAddClick();
            }}
          >
            新建
          </Button>
        )}
      </Box>
      <Box display="flex" flexDirection="column" className={classes.boxControl}>
        {props.items &&
          props.items.map((element) => (
            <Box key={element.key} display="flex" paddingTop="10px">
              <TextField
                className={classes.styledTextField}
                type="string"
                variant="outlined"
                value={
                  element.children.props.formData !== undefined
                    ? element.children.props.formData
                    : ""
                }
                onChange={(event) =>
                  element.children.props.onChange(event.target.value)
                }
                InputProps={{
                  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") event.preventDefault();
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        display="flex"
                        flexDirection="column"
                        style={{ width: "32px", height: "32px" }}
                        borderLeft={1}
                        borderColor={Common.allColor.border}
                      >
                        <Box display="flex" justifyContent="center">
                          <IconButton
                            classes={{
                              root: classes.IconButtonControl,
                            }}
                            disabled={element.hasMoveUp ? false : true}
                            onClick={element.onReorderClick(
                              element.index,
                              element.index - 1
                            )}
                          >
                            <ArrowDropUpIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box display="flex" justifyContent="center">
                          <IconButton
                            classes={{
                              root: classes.IconButtonControl,
                            }}
                            disabled={element.hasMoveDown ? false : true}
                            onClick={element.onReorderClick(
                              element.index,
                              element.index + 1
                            )}
                          >
                            <ArrowDropDownIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                classes={{
                  label: fontClasses.DeleteFont,
                }}
                onClick={element.onDropIndexClick(element.index)}
              >
                删除
              </Button>
            </Box>
          ))}
      </Box>
    </Box>
  );
};

function ArrayFieldTemplateObject(props: ArrayFieldTemplateProps) {
  const marginLevel = Utils.getMarginLevel(props.idSchema.$id);
  const objectWidthLevel = Utils.getObjectWidthLevel(props.idSchema.$id);
  const objectTopLevel = Utils.getObjectTopMarginLevel(props.idSchema.$id);
  const buttonClasses = Common.buttonStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box style={{ width: "712px", marginLeft: marginLevel }}>
      {props.items &&
        props.items.map((element) => (
          <div key={element.key}>
            <Box display="flex" flexDirection="row" marginTop={objectTopLevel}>
              <Box width={objectWidthLevel}>{element.children}</Box>
              <Box>
                <Button
                  onClick={element.onDropIndexClick(element.index)}
                  style={{
                    marginTop: "61px",
                    right: "70px",
                    zIndex: 5,
                  }}
                  className={buttonClasses.NoHoverBorderButton}
                  disableRipple
                  disableElevation
                  disableFocusRipple
                >
                  <Typography
                    className={fontClasses.unboldFont}
                    style={{ color: aColor.primaryColor }}
                  >
                    删除
                  </Typography>
                </Button>
              </Box>
            </Box>
          </div>
        ))}
      {props.canAdd && (
        <div className="row">
          <Button
            className={buttonClasses.NoHoverBorderButton}
            style={{ minWidth: "18.66px", padding: "0px" }}
            onClick={() => {
              props.onAddClick();
            }}
            type="button"
            disableRipple
            disableElevation
            disableFocusRipple
          >
            {Icon.addCircleOutlineSmall}
          </Button>
        </div>
      )}
    </Box>
  );
}

const exportArrayFieldTemplate = {
  ArrayFieldTemplate,
  ArrayFieldTemplateObject,
};

export default exportArrayFieldTemplate;
