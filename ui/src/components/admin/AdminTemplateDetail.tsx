import React, { useEffect, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { RouteComponentProps } from "react-router";
import { AppBar, Button } from "@material-ui/core";
import Common from "../../common/Common";
import MainBar from "../../containers/MainAppBar";
import TemplateService, {
  Template,
  templateJSON,
} from "../../api/TemplateService";
import { templateItemValueList, AdminItemDetailProps } from "./AdminPageUtil";
import {
  AdminItemDisplay,
  AdminTitle,
  AdminDivider,
  AdminSnackbar,
  AdminReviewRadio,
  AdminReviewInput,
  AdminReviewDetail,
  AdminCreatorInfo,
} from "./AdminDisplayUtil";
import { OrderedList } from "../search/TemplateDialog";
import {
  REVIEW_STATUS_WAITING_REVIEW,
  REVIEW_STATUS_REJECTED,
  REVIEW_STATUS_PASSED_REVIEW,
  REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW,
} from "../../common/ReviewStatusUtils";
import LoadingComponent from "../LoadingComponent";
import AdminService from "../../api/AdminService";
import UserService from "../../api/UserService";

const useStyles = makeStyles((theme: Theme) => ({
  appbar: {
    display: "flex",
    zIndex: theme.zIndex.drawer + 1,
  },
  boxControl: {
    marginLeft: "80px",
    width: "700px",
  },
}));

const AdminTemplateDetail: React.FC<RouteComponentProps<{ id: string }>> = ({
  match,
}) => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" marginTop="80px">
      <Box display="flex">
        <AppBar className={classes.appbar}>
          <MainBar />
        </AppBar>
        <Box height="64px" />
      </Box>
      <Box
        display="flex"
        flexGrow={1}
        flexBasis="1024px"
        justifyContent="center"
      >
        <ItemDetail id={match.params.id} />
      </Box>
    </Box>
  );
};

const ItemDetail: React.FC<AdminItemDetailProps> = ({ id }) => {
  const classes = useStyles();
  const buttonStyle = Common.buttonStyles();

  const [isLoaded, setIsLoaded] = useState(false);
  const [templateJsonData, setTemplateJsonData] = useState<templateJSON>();
  const [selectedValue, setSelectedValue] = React.useState(
    REVIEW_STATUS_PASSED_REVIEW
  );
  const [reviewComment, setReviewComment] = React.useState("");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [status, setStatus] = React.useState(0);
  const stateList = [
    REVIEW_STATUS_PASSED_REVIEW,
    REVIEW_STATUS_REJECTED,
    REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  ];
  const stateListPassedPreview = [
    REVIEW_STATUS_PASSED_REVIEW,
    REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  ];
  const [isAdmin, setIsAdmin] = React.useState(true);
  const [adminChecked, setAdminChecked] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReviewComment(event.target.value);
  };

  const handleClick = async () => {
    const templateUpdataStatus: number = await AdminService.updateReview(
      id,
      "template",
      userName,
      selectedValue,
      reviewComment
    );
    setStatus(templateUpdataStatus);
    if (templateUpdataStatus === 0) {
      const templateObject: Template = await TemplateService.getTemplate(id);
      setTemplateJsonData(templateObject.json_schema);
    }
    setAlertOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  useEffect(() => {
    void (async () => {
      try {
        const isUserAdmin = await AdminService.checkAdmin();
        setIsAdmin(isUserAdmin);
        setAdminChecked(true);
        const name = await UserService.getUserName();
        setUserName(name);
      } catch (e) {
        UserService.navigateToErrorPage();
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (isAdmin && adminChecked) {
          const templateObject: Template = await TemplateService.getTemplate(
            id
          );
          setTemplateJsonData(templateObject.json_schema);
        } else if (!isAdmin && adminChecked) {
          UserService.navigateToErrorPage();
        }
      } catch (e) {
        UserService.navigateToNotFoundPage();
        setTemplateJsonData(undefined);
        throw e;
      }
      setIsLoaded(true);
    })();
  }, [id, isAdmin, adminChecked]);

  if (!isLoaded || !templateJsonData) {
    return <LoadingComponent />;
  }

  return (
    <Box display="flex" flexDirection="column" justifyContent="flex-start">
      <AdminSnackbar
        status={status}
        open={alertOpen}
        handleClose={() => {
          setAlertOpen(false);
        }}
      />
      <Box display="flex" flexDirection="row">
        <AdminTitle type="templates" chinese_name={templateJsonData!.title} />
        <AdminCreatorInfo
          author={templateJsonData!.author}
          create_timestamp={templateJsonData!.create_timestamp}
        />
      </Box>
      <AdminDivider value="审核内容" />
      <Box display="flex" flexDirection="column" className={classes.boxControl}>
        {templateItemValueList.map((value) => {
          if (value !== "author" && value !== "create_timestamp") {
            return (
              <AdminItemDisplay
                key={"templatedetail" + value}
                type="template"
                jsonData={templateJsonData!}
                value={value}
              />
            );
          } else {
            return <Box key={"worddetailnodisplay" + value}></Box>;
          }
        })}
      </Box>
      <AdminDivider value="模板大纲" />
      <Box display="flex" className={classes.boxControl}>
        <OrderedList wordOrder={templateJsonData!.word_order!} layer={0} />
      </Box>
      <AdminDivider value="审核结果" />
      {templateJsonData.review_status === REVIEW_STATUS_WAITING_REVIEW ? (
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          className={classes.boxControl}
        >
          <AdminReviewRadio
            selectedValue={selectedValue}
            stateList={stateList}
            handleChange={handleChange}
          />
          <AdminReviewInput
            reviewComment={reviewComment}
            handleInput={handleInput}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button className={buttonStyle.Primary} onClick={handleClick}>
              确定
            </Button>
          </Box>
        </Box>
      ) : templateJsonData.review_status ===
        REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW ? (
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          className={classes.boxControl}
        >
          <AdminReviewRadio
            selectedValue={selectedValue}
            stateList={stateListPassedPreview}
            ifApplyPreviewPassed={true}
            handleChange={handleChange}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button className={buttonStyle.Primary} onClick={handleClick}>
              确定
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          className={classes.boxControl}
        >
          <AdminReviewDetail type="template" jsonData={templateJsonData} />
        </Box>
      )}
    </Box>
  );
};

export default AdminTemplateDetail;
