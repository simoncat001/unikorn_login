import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@material-ui/core";

import { useHistory } from "react-router-dom";
import Common from "../common/Common";
import Map from "../common/Map";
import ReviewStatusUtils from "../common/ReviewStatusUtils";
import { useStyles, BreadNav, DetailDivier } from "./DetailUtils";
import {
  ERROR_PATH,
  DEVELOPMENT_DATA_EDIT_PATH,
  DEVELOPMENT_DATA_PATH,
  DEVELOPMENT_DATA_DETAIL_PATH,
} from "../common/Path";
import { CenterSnackbar } from "../common/Utils";
import DevelopmentDataService, {
  DevelopmentData,
  DevelopmentDataJSON,
} from "../api/DevelopmentDataService";
import Icon from "./Icon";
import LoadingComponent from "./LoadingComponent";
import EditButton from "./detail/EditButton";
import RejectedReason from "./detail/RejectedReason";
import DetailDataItem from "./detail/DetailDataItem";
import PreviewCard from "./detail/PreviewCard";
import ContentObject from "./DevelopmentDataContent";
import { REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED } from "../common/ReviewStatusUtils";

const PublishedButton: React.FC<{
  review_status: string;
  id: string;
  setDevJsonData: React.Dispatch<
    React.SetStateAction<DevelopmentDataJSON | undefined>
  >;
  setStatus: React.Dispatch<React.SetStateAction<number>>;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ review_status, id, setDevJsonData, setStatus, setAlertOpen }) => {
  const btnClasses = Common.buttonStyles();
  const handleClick = async () => {
    try {
      const status = await DevelopmentDataService.applyPublished(id);
      setStatus(status);
      if (status === 0) {
        const devDataObject: DevelopmentData =
          await DevelopmentDataService.getDevData(id);
        setDevJsonData(devDataObject.json_data);
      }
      setAlertOpen(true);
    } catch (e) {
      console.error(e);
    }
  };
  if (review_status === REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED)
    return (
      <Button
        className={btnClasses.SecondarySmallIcon}
        startIcon={Icon.editIcon}
        disableRipple
        onClick={handleClick}
      >
        数据发表
      </Button>
    );
  else return null;
};

const DevDataDetailComponent: React.FC<{ id: string; publicPage: boolean }> = ({
  id,
  publicPage,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [devJsonData, setDevJsonData] = useState(JSON.parse("{}"));
  const [alertOpen, setAlertOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  const history = useHistory();
  useEffect(() => {
    void (async () => {
      try {
        const devDataObject: DevelopmentData =
          await DevelopmentDataService.getDevData(id);
        setDevJsonData(devDataObject.json_data);
      } catch (e) {
        setDevJsonData({});
      }
      setIsLoaded(true);
    })();
  }, [id]);

  if (!isLoaded) {
    return <LoadingComponent />;
  }
  if (!devJsonData) {
    history.replace(ERROR_PATH);
    return null;
  }

  const DetailTitle = devJsonData.title;

  return (
    <Box display="flex" flexDirection="column" m={4}>
      <CenterSnackbar
        open={alertOpen}
        status={status}
        handleClose={() => {
          setAlertOpen(false);
        }}
        ifPublished={true}
      />
      {!publicPage ? (
        <BreadNav
          HOME_PATH={DEVELOPMENT_DATA_PATH}
          breadName={DetailTitle}
          DETAIL_PATH={DEVELOPMENT_DATA_DETAIL_PATH + "/" + id}
        />
      ) : (
        <div />
      )}

      <Box display="flex" my={3}>
        <Typography className={fontClasses.DetailTitle}>
          {DetailTitle}
        </Typography>
      </Box>
      {!publicPage ? (
        <Box display="flex" justifyContent="flex-end">
          <Box marginRight="10px">
            <EditButton
              review_status={devJsonData.review_status}
              EDIT_PATH={DEVELOPMENT_DATA_EDIT_PATH + "/" + id}
              type={"data"}
            />
          </Box>
          <Box>
            <PublishedButton
              review_status={devJsonData.review_status}
              id={id}
              setDevJsonData={setDevJsonData}
              setAlertOpen={setAlertOpen}
              setStatus={setStatus}
            />
          </Box>
        </Box>
      ) : null}

      <Box display="flex" className={classes.detailBackground}>
        <Box display="flex" flexDirection="row" mx={2} my={3}>
          <Box display="flex" flexDirection="column">
            <DetailDataItem
              label={Map.developmentDataItemMap.author}
              content={devJsonData.author}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.create_timestamp}
              content={devJsonData.create_timestamp}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.reviewer}
              content={devJsonData.reviewer}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.review_status}
              content={
                ReviewStatusUtils.isDraft(devJsonData.review_status)
                  ? ""
                  : ReviewStatusUtils.reviewStatusMap[devJsonData.review_status]
              }
              icon={
                <RejectedReason
                  review_status={devJsonData.review_status}
                  rejected_reason={devJsonData.rejected_reason}
                />
              }
            />
          </Box>
          <DetailDivier />
          <Box
            display="flex"
            flexDirection="column"
            ml={3}
            style={{ width: "auto" }}
          >
            <DetailDataItem
              label={Map.developmentDataItemMap.template_name}
              content={devJsonData.template_name}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.data_generate_method}
              content={
                Map.dataGenerateMethodMap[devJsonData.data_generate_method]
              }
              isLeft={false}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.institution}
              content={devJsonData.institution}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.template_type}
              content={Map.templateTypeMap[devJsonData.template_type]}
              isLeft={false}
            />
            <DetailDataItem
              label={Map.developmentDataItemMap.MGID}
              content={devJsonData.MGID}
              isLeft={false}
            />
          </Box>
        </Box>
      </Box>
      <PreviewCard
        itemType={"data"}
        content={<ContentObject content={devJsonData.data_content} />}
      />
    </Box>
  );
};

export default DevDataDetailComponent;
