import React, { useState, useEffect } from "react";
import MGIDApplyService, {
  MGIDApplyGet,
  MGIDApplyJSON,
} from "../../api/MGIDApplyService";
import { Box } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import LoadingComponent from "../LoadingComponent";
import MGIDInternalDataComponent from "../MGIDInternalDataComponent";
import AdminService from "../../api/AdminService";
import UserService from "../../api/UserService";
import { CitationButton, MGIDInfo } from "../MGIDDetailComponent";
import { AdminTitle, AdminDivider, AdminCreatorInfo } from "./AdminDisplayUtil";

export const useStyles = makeStyles(() =>
  createStyles({
    boxControl: {
      marginLeft: "80px",
      width: "700px",
    },
    containerWidth: {
      width: "780px",
    },
  })
);

const AdminMGIDDetailItem: React.FC<{ MGID: string }> = ({ MGID }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [MGIDSource, setMGIDSource] = useState("");
  const [MGIDJsonData, setMGIDJsonData] = useState<MGIDApplyJSON | null>(null);
  const [InternalDataId, setInternalDataId] = useState("");
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [adminChecked, setAdminChecked] = React.useState(false);
  const classes = useStyles();

  useEffect(() => {
    void (async () => {
      try {
        const isUserAdmin = await AdminService.checkAdmin();
        setIsAdmin(isUserAdmin);
        setAdminChecked(true);
      } catch (e) {
        UserService.navigateToErrorPage();
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (isAdmin && adminChecked) {
          const MGIDGet: MGIDApplyGet = await MGIDApplyService.getMGID(MGID);
          setMGIDJsonData(MGIDGet.data.json_data);
          setInternalDataId(MGIDGet.data.id);
          setMGIDSource(MGIDGet.type);
        } else if (!isAdmin && adminChecked) {
          UserService.navigateToErrorPage();
        }
      } catch (e) {
        UserService.navigateToNotFoundPage();
      }
      setIsLoaded(true);
    })();
  }, [MGID, isAdmin, adminChecked]);

  if (!isLoaded || !MGIDJsonData) {
    return <LoadingComponent />;
  }

  if (MGIDSource === "internal") {
    return <MGIDInternalDataComponent id={InternalDataId} />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      className={classes.containerWidth}
    >
      <Box display="flex" flexDirection="row" justifyContent="flex-end">
        {/* TODO : citation box position and author name */}
        <CitationButton MGIDJsonData={MGIDJsonData} />
      </Box>
      <Box display="flex" flexDirection="row">
        <AdminTitle type="MGID" chinese_name={MGIDJsonData!.data_title} />
        <AdminCreatorInfo
          author={MGIDJsonData!.MGID_submitter}
          create_timestamp={MGIDJsonData!.create_timestamp}
        />
      </Box>
      <AdminDivider value="审核内容" />
      <Box className={classes.boxControl}>
        <MGIDInfo MGIDJsonData={MGIDJsonData} />
      </Box>
    </Box>
  );
};

export default AdminMGIDDetailItem;
