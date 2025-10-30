import React from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Common from "../common/Common";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import OrganizationService from "../api/OrganizationService";
import CountryService from "../api/CountryService";
import Icons from "../components/Icon";
import { CenterSnackbar } from "../common/Utils";

const aColor = Common.allColor;
const commonProps = Common.commonProps;

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: "100vh",
    },
    card: {
      color: "white",
      border: `solid 0.5px ${aColor.lighterBorder}`,
      height: "200px",
      width: "388px",
      marginLeft: "auto",
      marginRight: "auto",
    },
    title: {
      width: "90px",
      marginTop: "24px",
      marginLeft: "24px",
    },
    titleText: {
      fontSize: "20px",
      fontWeight: 600,
      color: aColor.bodyText,
    },
    code: {
      marginTop: "20px",
      marginLeft: "26px",
    },
    close: {
      marginTop: "19px",
      marginLeft: "240px",
    },
    closebutton: {
      height: "13px",
      width: "13px",
      minWidth: "13px",
    },
    buttons: {
      display: "flex",
      alignItems: "flex-end",
      marginLeft: "251px",
      marginTop: "23px",
    },
    filename: {
      marginTop: "5px",
      marginLeft: "100px",
      height: "20px",
    },
  })
);

export interface ConfirmationDialogRawProps {
  isCountry: boolean;
  onClose?: (value?: string) => void;
  setUpdateStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

function AdminUpdateCode(props: ConfirmationDialogRawProps) {
  const { isCountry, setUpdateStatus } = props;
  const classes = useStyles();
  const aButtonStyles = Common.buttonStyles();
  const aFontStyles = Common.fontStyles();
  const [open, setOpen] = React.useState(false);
  const emptyFile = new File([], "");
  const [selectedFile, setSelectedFile] = React.useState(emptyFile);
  const [fileName, setFileName] = React.useState("");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [errorState, setErrorCode] = React.useState(0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setFileName("");
    setSelectedFile(emptyFile);
    setOpen(false);
  };

  const handleCancel = async () => {
    setFileName("");
    setSelectedFile(emptyFile);
  };
  const handleSubmit = async (selectedFile: File | undefined) => {
    if (typeof selectedFile !== undefined && selectedFile !== null) {
      const insertFile = selectedFile as File;
      if (isCountry) {
        const status: number = await CountryService.insertCountryExcel(
          insertFile
        );
        setErrorCode(status);
      } else {
        const status: number =
          await OrganizationService.insertOrganizationExcel(insertFile);
        setErrorCode(status);
      }
      setUpdateStatus(true);
      setAlertOpen(true);
      setFileName("");
      handleClose();
      setSelectedFile(emptyFile);
    } else {
      setSelectedFile(emptyFile);
      setFileName("");
    }
  };
  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      const targetFile = event.target.files as FileList;
      setSelectedFile(targetFile[0]);
      setFileName(targetFile[0].name);
      event.target.value = "";
    }
  };
  return (
    <Box>
      <CenterSnackbar
        open={alertOpen}
        status={errorState}
        handleClose={() => {
          setAlertOpen(false);
        }}
      />
      <Button
        className={aButtonStyles.SecondarySmallIcon}
        onClick={handleClickOpen}
      >
        {Icons.addIcon}
        上传编号
      </Button>
      <Dialog open={open} className={classes.root} onClose={handleClose}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Card className={classes.card}>
            <Box display="flex" flexDirection="row">
              <Box className={classes.title}>
                <Typography className={classes.titleText}>文件上传</Typography>
              </Box>
              <Box className={classes.close}>
                <Button className={classes.closebutton} onClick={handleClose}>
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
              {isCountry ? (
                <Typography
                  className={aFontStyles.boldFont}
                  style={{
                    color: aColor.bodyText,
                  }}
                >
                  国家编号:
                </Typography>
              ) : (
                <Typography
                  className={aFontStyles.boldFont}
                  style={{
                    color: aColor.bodyText,
                  }}
                >
                  单位编号:
                </Typography>
              )}
              <Box marginLeft="10px">
                <Button
                  variant="contained"
                  component="label"
                  className={aButtonStyles.SecondaryIcon}
                  {...commonProps.buttonDisable}
                >
                  点击上传
                  <input
                    id="uploadCsvCode"
                    type="file"
                    hidden
                    onChange={handleCapture}
                    multiple={false}
                    accept={".csv"}
                  />
                </Button>
              </Box>
            </Box>
            <Box display="flex" className={classes.filename}>
              <Typography className={aFontStyles.boldFont}>
                <Box component="span" color={aColor.primaryColor}>
                  {fileName}
                </Box>
              </Typography>
            </Box>
            <Box className={classes.buttons} marginBottom="0px">
              <Button
                className={aButtonStyles.SecondarySmall}
                onClick={() => handleCancel()}
              >
                取消
              </Button>
              <Box marginLeft="17px">
                <Button
                  className={aButtonStyles.PrimarySmall}
                  onClick={() => handleSubmit(selectedFile)}
                >
                  确定
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Dialog>
    </Box>
  );
}
export default AdminUpdateCode;
