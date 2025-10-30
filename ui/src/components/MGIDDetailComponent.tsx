import React, { useState, useEffect } from "react";
import MGIDApplyService, {
  MGIDApplyGet,
  MGIDApplyJSON,
} from "../api/MGIDApplyService";
import { Box, Typography, Link, Button, Snackbar } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import Utils from "../common/Utils";
import { useHistory } from "react-router-dom";
import Common from "../common/Common";
import Map from "../common/Map";
import { ERROR_PATH, MGID_PATH } from "../common/Path";
import LoadingComponent from "./LoadingComponent";
import MGIDInternalDataComponent from "./MGIDInternalDataComponent";

const aColor = Common.allColor;

export const useStyles = makeStyles(() =>
  createStyles({
    titleCol: {
      width: "120px",
      minWidth: "120px",
      float: "left",
    },
    link: {
      color: aColor.bodyText,
      textDecoration: "underline",
      "&:hover": {
        textDecoration: "none",
      },
    },
    itemControl: {
      minHeight: "35px",
    },
    boxControl: {
      marginLeft: "80px",
      width: "700px",
    },
    citationButtonControl: {
      marginRight: "94px",
    },
  })
);

export function getClickableLink(link: string) {
  return link.startsWith("http://") || link.startsWith("https://")
    ? link
    : `//${link}`;
}

export const InfoItem: React.FC<{
  label: string;
  content: string;
  isURL?: boolean;
}> = ({ label, content, isURL = false }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="row" className={classes.itemControl}>
      <Box className={classes.titleCol}>
        <Typography className={fontClasses.boldFont}>{label}：</Typography>
      </Box>
      <Box display="flex" flexGrow={1}>
        <Typography
          className={fontClasses.unboldFont}
          style={{ float: "left", wordBreak: "break-all" }}
        >
          {isURL ? (
            <Link className={classes.link} href={getClickableLink(content)}>
              {content}
            </Link>
          ) : (
            content
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export const CitationButton: React.FC<{ MGIDJsonData: MGIDApplyJSON }> = ({
  MGIDJsonData,
}) => {
  const classes = useStyles();
  const btnClasses = Common.buttonStyles();
  const [open, setOpen] = React.useState(false);
  const citationString =
    MGIDJsonData.author_name +
    "(" +
    Utils.getYear(MGIDJsonData.MGID) +
    "):" +
    MGIDJsonData.data_title +
    ",MGSDB," +
    window.location.host +
    [MGID_PATH, MGIDJsonData.MGID].join("/");

  const clickToCopy = () => {
    navigator.clipboard.writeText(citationString);
    setOpen(true);
  };

  function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      className={classes.citationButtonControl}
    >
      <Box display="flex">
        <Button
          onClick={clickToCopy}
          className={btnClasses.SecondarySmall}
          disableRipple
        >
          引用
        </Button>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          已粘贴到剪切板
        </Alert>
      </Snackbar>
    </Box>
  );
};

export const MGIDInfo: React.FC<{ MGIDJsonData: MGIDApplyJSON }> = ({
  MGIDJsonData,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <InfoItem
        label={Map.MGIDItemMap.data_title}
        content={MGIDJsonData.data_title}
      />
      <InfoItem
        label={Map.MGIDItemMap.author_name}
        content={MGIDJsonData.author_name}
      />
      <InfoItem
        label={Map.MGIDItemMap.author_organization}
        content={MGIDJsonData.author_organization}
      />
      <InfoItem
        label={Map.MGIDItemMap.abstract}
        content={MGIDJsonData.abstract}
      />
      <InfoItem
        label={Map.MGIDItemMap.source_type}
        content={Map.sourceTypeMap[MGIDJsonData.source_type]}
      />
      <InfoItem
        label={Map.MGIDItemMap.data_url}
        content={MGIDJsonData.data_url}
        isURL={true}
      />
      <InfoItem label={Map.MGIDItemMap.MGID} content={MGIDJsonData.MGID} />
    </Box>
  );
};

export const MGIDDetailComponent: React.FC<{ MGID: string }> = ({ MGID }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [MGIDSource, setMGIDSource] = useState("");
  const [MGIDJsonData, setMGIDJsonData] = useState<MGIDApplyJSON | null>(null);
  const [InternalDataId, setInternalDataId] = useState("");
  const fontClasses = Common.fontStyles();
  const history = useHistory();

  useEffect(() => {
    void (async () => {
      try {
        const MGIDGet: MGIDApplyGet = await MGIDApplyService.getMGID(MGID);
        setMGIDJsonData(MGIDGet.data.json_data);
        setInternalDataId(MGIDGet.data.id);
        setMGIDSource(MGIDGet.type);
      } catch (e) {
        console.log(e);
      }
      setIsLoaded(true);
    })();
  }, [MGID]);

  if (!isLoaded) {
    return <LoadingComponent />;
  }
  if (!MGIDJsonData) {
    history.replace(ERROR_PATH);
    return null;
  }
  if (MGIDSource === "internal") {
    return <MGIDInternalDataComponent id={InternalDataId} />;
  }

  return (
    <Box display="flex" flexDirection="column" width="600px" marginTop="60px">
      <Box display="flex" m={2}>
        <Box display="flex" flexGrow={1}>
          <Typography className={fontClasses.H4}>
            {MGIDJsonData.data_title}
          </Typography>
        </Box>
        <Box display="flex">
          <CitationButton MGIDJsonData={MGIDJsonData} />
        </Box>
      </Box>
      <Box m={2} flexGrow={1} marginTop="30px">
        <MGIDInfo MGIDJsonData={MGIDJsonData} />
      </Box>
    </Box>
  );
};
