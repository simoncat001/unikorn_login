import React, { useEffect, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { RouteComponentProps } from "react-router";
import { AppBar, Button } from "@material-ui/core";
import Common from "../../common/Common";
import MainBar from "../../containers/MainAppBar";
import WordService, { Word, WordJSON } from "../../api/WordService";
import { wordItemValueList, AdminItemDetailProps } from "./AdminPageUtil";
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
import {
  REVIEW_STATUS_WAITING_REVIEW,
  REVIEW_STATUS_REJECTED,
  REVIEW_STATUS_PASSED_REVIEW,
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

const ItemDetail: React.FC<AdminItemDetailProps> = ({ id }) => {
  const classes = useStyles();
  const buttonStyle = Common.buttonStyles();

  const [isLoaded, setIsLoaded] = useState(false);
  const [wordJsonData, setWordJsonData] = useState<WordJSON>();
  const [selectedValue, setSelectedValue] = React.useState(
    REVIEW_STATUS_PASSED_REVIEW
  );
  const [reviewComment, setReviewComment] = React.useState("");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [status, setStatus] = React.useState(0);
  const stateList = [REVIEW_STATUS_PASSED_REVIEW, REVIEW_STATUS_REJECTED];
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [adminChecked, setAdminChecked] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReviewComment(event.target.value);
  };
  
  const handleClick = async () => {
    const wordUpdateStatus: number = await AdminService.updateReview(
      id,
      "word",
      userName,
      selectedValue,
      reviewComment
    );
    setStatus(wordUpdateStatus);
    if (wordUpdateStatus === 0) {
      const wordObject: Word = await WordService.getWord(id);
      setWordJsonData(wordObject.json_data);
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
        const name = await UserService.getUserName();
        setUserName(name);
      } catch (e) {
        console.error('获取用户信息失败:', e);
        setIsAdmin(false);
      } finally {
        setAdminChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        if (adminChecked) {
          if (isAdmin) {
            try {
              const wordObject = await WordService.getWord(id);
              if (wordObject && wordObject.json_data) {
                setWordJsonData(wordObject.json_data);
              }
            } catch (wordError) {
              console.error('获取单词数据失败:', wordError);
              if (wordError instanceof Error && wordError.message.includes('404')) {
                try {
                  UserService.navigateToNotFoundPage();
                } catch (navError) {
                  console.error('导航到404页面失败:', navError);
                }
              }
            }
          } else {
            try {
              UserService.navigateToErrorPage();
            } catch (navError) {
              console.error('导航到错误页面失败:', navError);
            }
          }
        }
      } catch (e) {
        console.error('处理单词详情失败:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, [id, isAdmin, adminChecked]);

  if (!isLoaded || !wordJsonData) {
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
        <AdminTitle
          type="word"
          serial_number={wordJsonData!.serial_number}
          chinese_name={wordJsonData!.chinese_name}
        />
        <AdminCreatorInfo
          author={wordJsonData!.author}
          create_timestamp={wordJsonData!.create_timestamp}
        />
      </Box>
      <AdminDivider value="审核内容" />
      <Box display="flex" flexDirection="column" className={classes.boxControl}>
        {wordItemValueList.map((value) => {
          if (value !== "author" && value !== "create_timestamp" && (wordJsonData as any)[value] !== undefined) {
            return (
              <AdminItemDisplay
                key={"worddetail" + value}
                type="word"
                jsonData={wordJsonData}
                value={value}
              />
            );
          }
          return <Box key={"worddetailnodisplay" + value}></Box>;
        })}
        
        {(wordJsonData.data_type === "number" || 
          wordJsonData.data_type === "number_range") && 
          wordJsonData.unit && (
          <AdminItemDisplay
            key="worddetailunit"
            type="word"
            jsonData={wordJsonData}
            value="unit"
          />
        )}
        
        {wordJsonData.data_type === "enum_text" && 
          wordJsonData.options && (
          <AdminItemDisplay
            key="worddetailoptions"
            type="word"
            jsonData={wordJsonData}
            value="options"
          />
        )}
        
        <AdminItemDisplay
          key="worddetailreview_status"
          type="word"
          jsonData={wordJsonData}
          value="review_status"
        />
        
        {wordJsonData.reviewer && (
          <AdminItemDisplay
            key="worddetailreviewer"
            type="word"
            jsonData={wordJsonData}
            value="reviewer"
          />
        )}
        
        {wordJsonData.rejected_reason && (
          <AdminItemDisplay
            key="worddetailrejected_reason"
            type="word"
            jsonData={wordJsonData}
            value="rejected_reason"
          />
        )}
      </Box>
      
      <AdminDivider value="审核结果" />
      {wordJsonData.review_status === REVIEW_STATUS_WAITING_REVIEW ? (
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
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          className={classes.boxControl}
        >
          <AdminReviewDetail type="word" jsonData={wordJsonData} />
        </Box>
      )}
    </Box>
  );
};

const AdminWordDetail: React.FC<RouteComponentProps<{ id: string }>> = ({
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

export default AdminWordDetail;
