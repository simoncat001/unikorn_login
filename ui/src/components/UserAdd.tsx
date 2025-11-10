import React, { useState, useEffect } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Common from "../common/Common";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import FieldTemplate from "../components/FieldTemplate";
import { FormProps } from "@rjsf/core";
import Form from "@rjsf/material-ui";
import { JSONSchema7 } from "json-schema";
import UserService, { UserAddInfo } from "../api/UserService";
import { AdminUserAddSnackbar } from "./admin/AdminDisplayUtil";
import AdminService from "../api/AdminService";

var uiSchema: any = {
  user_name: { "ui:FieldTemplate": FieldTemplate.FieldTemplateAlignLeftStr },
  display_name: {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateAlignLeftStr,
  },
  country: { "ui:FieldTemplate": FieldTemplate.FieldTemplateAlignLeftStr },
  organization: { "ui:FieldTemplate": FieldTemplate.FieldTemplateAlignLeftStr },
  user_type: {
    "ui:FieldTemplate": FieldTemplate.FieldTemplateUserEnumRadioRow,
  },
  "ui:order": [
    "user_name",
    "display_name",
    "country",
    "organization",
    "user_type",
  ],
};

var userAddSchema: JSONSchema7 = {
  title: "",
  type: "object",
  required: [
    "user_name",
    "display_name",
    "country",
    "organization",
    "user_type",
  ],
  properties: {
    user_name: { type: "string", title: "用户名", default: "" },
    display_name: { type: "string", title: "用户昵称", default: "" },
    country: { type: "string", title: "国家/地区", default: "" },
    organization: { type: "string", title: "单位名称", default: "" },
    user_type: {
      type: "string",
      title: "用户类型",
      default: "normal",
      enum: ["normal"],
    },
  },
};

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: "100vh",
    },
    card: {
      color: "white",
      border: `solid 0.5px ${aColor.lighterBorder}`,
      minHeight: "335px",
      width: "418px",
      marginLeft: "auto",
      marginRight: "auto",
    },
    title: {
      width: "90px",
      marginTop: "28px",
      marginLeft: "18px",
    },
    titleText: {
      fontSize: "20px",
      fontWeight: 600,
      color: aColor.bodyText,
    },
    code: {
      marginTop: "13px",
    },
    close: {
      marginTop: "28px",
      marginLeft: "259px",
    },
    closeButton: {
      height: "13px",
      width: "13px",
      minWidth: "13px",
    },
    cancleButton: {
      marginTop: "15px",
      marginLeft: "276px",
    },
    sumbitButton: {
      marginTop: "15px",
      marginLeft: "17px",
    },
  })
);

export interface ConfirmationDialogRawProps {
  onClose?: (value?: string) => void;
}

export type AdminUserAddProps = {
  openDialog: boolean;
  handleCardClose: () => void;
  setUpdateStatus: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserAdd: React.FC<AdminUserAddProps> = ({
  openDialog,
  handleCardClose,
  setUpdateStatus,
}) => {
  const classes = useStyles();
  const aButtonStyles = Common.buttonStyles();
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [addStatus, setAddStatus] = React.useState(1);
  const [userInformationData, setUserInformationData] = useState(
    JSON.parse("{}")
  );

  useEffect(() => {
    void (async () => {
      try {
        const adminCheck = await AdminService.checkSuperAdmin();
        if (adminCheck) {
          const user_type: JSONSchema7 = userAddSchema.properties!
            .user_type as JSONSchema7;
          user_type["enum"] = ["normal", "admin"];
          userAddSchema.properties!.user_type = user_type;
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    })();
  }, []);

  const handleCancel = async () => {
    setUserInformationData(JSON.parse("{}"));
  };

  const onSubmit = async (form: FormProps<any>) => {
    const UserAddResult: UserAddInfo = await UserService.addUser(
      JSON.stringify(form.formData)
    );
    const status: number = UserAddResult.status;
    setAddStatus(status);
    if (status === 0) {
      setUserInformationData(JSON.parse("{}"));
      handleCardClose();
    }
    setUpdateStatus(true);
    setAlertOpen(true);
  };

  return (
    <Box>
      <AdminUserAddSnackbar
        status={addStatus}
        open={alertOpen}
        handleClose={() => {
          setAlertOpen(false);
        }}
      />
      <Dialog open={openDialog} className={classes.root}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Card className={classes.card}>
            <Box display="flex" flexDirection="row">
              <Box className={classes.title}>
                <Typography className={classes.titleText}>添加用户</Typography>
              </Box>
              <Box className={classes.close}>
                <Button
                  className={classes.closeButton}
                  onClick={handleCardClose}
                >
                  <CloseRoundedIcon />
                </Button>
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              className={classes.code}
            >
              <Box display="flex">
                <Form
                  uiSchema={uiSchema}
                  schema={userAddSchema}
                  formData={userInformationData}
                  onChange={(form) => {
                    setUserInformationData(form.formData);
                  }}
                  onSubmit={onSubmit}
                >
                  <Button
                    onClick={() => handleCancel()}
                    className={[
                      aButtonStyles.SecondarySmall,
                      classes.cancleButton,
                    ].join(" ")}
                    disableRipple
                    disableElevation
                    disableFocusRipple
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className={[
                      aButtonStyles.PrimarySmall,
                      classes.sumbitButton,
                    ].join(" ")}
                    disableRipple
                    disableElevation
                    disableFocusRipple
                  >
                    确认
                  </Button>
                </Form>
              </Box>
            </Box>
          </Card>
        </Box>
      </Dialog>
    </Box>
  );
};
export default UserAdd;
