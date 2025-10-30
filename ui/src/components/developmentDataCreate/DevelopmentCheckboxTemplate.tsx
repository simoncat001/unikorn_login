import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { WidgetProps } from "@rjsf/core";
import Common from "../../common/Common";
import DevelopmentUtils from "./DevelopmentDataUtils";

const aColor = Common.allColor;
const commonProps = Common.commonProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    Form: {
      flexGrow: 1,
      minHeight: "60px",
      marginLeft: "16px",
      marginRight: "16px",
      borderColor: aColor.lighterBorder,
    },
    FormList: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      marginTop: "0px",
      minHeight: "60px",
    },
    FormHead: {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
      alignSelf: "stretch",
      marginTop: "0px",
      borderColor: aColor.lighterBorder,
    },
    FormTitle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: "0px",
    },
    Height: {
      height: "60px",
    },
  })
);

const CheckBoxesWidget = ({
  id,
  schema,
  label,
  options,
  value,
  required,
  onChange,
}: WidgetProps) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box className={classes.Form} {...commonProps.Border}>
      <Box className={classes.FormList}>
        <FormControl fullWidth={true} required={required}>
          <Box
            className={clsx(classes.FormHead, classes.Height)}
            style={{
              backgroundColor: aColor.accentBackground,
            }}
            borderBottom={2}
          >
            <Box className={clsx(classes.FormTitle, classes.Height)}>
              <Box marginLeft="16px" marginTop="16px">
                <Typography className={fontClasses.boldFont}>
                  <Box component="span" display="flex" flexDirection="row">
                    <Box component="span" color={aColor.requiredRed}>
                      {required ? "*" : ""}
                    </Box>
                    <Box component="span">{label || schema.title}： </Box>
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box marginLeft="16px">
            {DevelopmentUtils.GetCheckboxGroup(
              id,
              schema,
              label,
              options,
              value,
              required,
              onChange
            )}
          </Box>
        </FormControl>
      </Box>
    </Box>
  );
};

const CheckBoxesWidgetObjectItem = ({
  id,
  schema,
  label,
  options,
  value,
  required,
  onChange,
}: WidgetProps) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box className={classes.Form}>
      <Box className={classes.FormList}>
        <FormControl fullWidth={true} required={required}>
          <Box className={clsx(classes.FormHead)}>
            <Box className={classes.FormTitle}>
              <Box marginTop="16px">
                <Typography className={fontClasses.boldFont}>
                  <Box component="span" display="flex" flexDirection="row">
                    <Box component="span" color={aColor.requiredRed}>
                      {required ? "*" : ""}
                    </Box>
                    <Box component="span">{label || schema.title}： </Box>
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Box>
          {DevelopmentUtils.GetCheckboxGroup(
            id,
            schema,
            label,
            options,
            value,
            required,
            onChange
          )}
        </FormControl>
      </Box>
    </Box>
  );
};

const CheckBoxesWidgetArrayItem = ({
  id,
  schema,
  label,
  options,
  value,
  required,
  onChange,
}: WidgetProps) => {
  const classes = useStyles();
  return (
    <Box className={classes.Form}>
      <Box className={classes.FormList}>
        <FormControl fullWidth={true} required={required}>
          {DevelopmentUtils.GetCheckboxGroup(
            id,
            schema,
            label,
            options,
            value,
            required,
            onChange
          )}
        </FormControl>
      </Box>
    </Box>
  );
};

const exportCheckBoxTemplate = {
  CheckBoxesWidget,
  CheckBoxesWidgetObjectItem,
  CheckBoxesWidgetArrayItem,
};

export default exportCheckBoxTemplate;
