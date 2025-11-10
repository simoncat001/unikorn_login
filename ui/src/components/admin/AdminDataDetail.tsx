import React, { useEffect, useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { RouteComponentProps } from "react-router";
import { AppBar, Button } from "@material-ui/core";
import Common from "../../common/Common";
import MainBar from "../../containers/MainAppBar";
import DevelopmentDataService, {
  DevelopmentData,
  DevelopmentDataJSON,
} from "../../api/DevelopmentDataService";
import { dataItemValueList, AdminItemDetailProps } from "./AdminPageUtil";
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
import ContentObject from "../DevelopmentDataContent";
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

const AdminDataDetail: React.FC<RouteComponentProps<{ id: string }>> = ({
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
  const [dataJsonData, setDataJsonData] = useState<DevelopmentDataJSON>();
  const [selectedValue, setSelectedValue] = React.useState(
    REVIEW_STATUS_PASSED_REVIEW
  );
  const [reviewComment, setReviewComment] = React.useState("");
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [status, setStatus] = React.useState(0);
  const stateList = [REVIEW_STATUS_PASSED_REVIEW, REVIEW_STATUS_REJECTED];
  const [isAdmin, setIsAdmin] = React.useState(true);
  const [adminChecked, setAdminChecked] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReviewComment(event.target.value);
  };

  const handleClick = async () => {
    const dataUpdataStatus: number = await AdminService.updateReview(
      id,
      "data",
      userName,
      selectedValue,
      reviewComment
    );
    setStatus(dataUpdataStatus);
    if (dataUpdataStatus === 0) {
      const dataObject: DevelopmentData =
        await DevelopmentDataService.getDevData(id);
      setDataJsonData(dataObject.json_data);
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
        // 确保在任何情况下都设置adminChecked为true
        setAdminChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        // 只有在管理员状态明确且已检查的情况下才尝试获取数据
        if (adminChecked) {
          if (isAdmin) {
            try {
              const dataObject = await DevelopmentDataService.getDevData(id);
              console.log('获取到的数据对象:', dataObject);
              
              // 检查dataObject是否存在
              if (!dataObject) {
                console.error('获取的数据对象为空');
                setDataJsonData(undefined);
              }
              // 检查json_data字段是否存在
              else if (!dataObject.json_data) {
                console.error('数据对象中缺少json_data字段');
                setDataJsonData(undefined);
              }
              // 检查json_data是否为对象类型
              else if (typeof dataObject.json_data !== 'object') {
                console.error('json_data不是有效的对象类型:', typeof dataObject.json_data);
                setDataJsonData(undefined);
              }
              // 数据格式正确，设置数据
              else {
                setDataJsonData(dataObject.json_data);
              }
            } catch (dataError) {
              console.error('获取数据详情失败:', dataError);
              // 只有在确定是404的情况下才导航到404页面
              if (dataError instanceof Error) {
                console.error('错误类型:', dataError.name, '错误消息:', dataError.message);
                if (dataError.message.includes('404')) {
                  try {
                    UserService.navigateToNotFoundPage();
                  } catch (navError) {
                    console.error('导航到404页面失败:', navError);
                  }
                }
              }
              setDataJsonData(undefined);
            }
          } else {
            // 用户不是管理员，导航到错误页面
            try {
              UserService.navigateToErrorPage();
            } catch (navError) {
              console.error('导航到错误页面失败:', navError);
            }
          }
        }
      } catch (e) {
        console.error('处理数据详情失败:', e);
      } finally {
        // 确保在任何情况下都设置isLoaded为true
        setIsLoaded(true);
      }
    })();
  }, [id, isAdmin, adminChecked]);

  if (!isLoaded || !dataJsonData) {
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
        <AdminTitle type="data" chinese_name={dataJsonData!.title} />
        <AdminCreatorInfo
          author={dataJsonData!.author}
          create_timestamp={dataJsonData!.create_timestamp}
        />
      </Box>
      <AdminDivider value="审核内容" />
      <Box display="flex" flexDirection="column" className={classes.boxControl}>
        {dataItemValueList.map((value) => {
          return (
            <AdminItemDisplay
              key={"dataitem" + Math.random()}
              type="data"
              jsonData={dataJsonData}
              value={value}
            />
          );
        })}
      </Box>
      <AdminDivider value="数据详情" />
      <Box display="flex" width="720px" m={1}>
        <ContentObject content={dataJsonData.data_content} />
      </Box>
      <AdminDivider value="审核结果" />
      {dataJsonData.review_status === REVIEW_STATUS_WAITING_REVIEW ? (
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
          <AdminReviewDetail type="data" jsonData={dataJsonData} />
        </Box>
      )}
    </Box>
  );
};

export default AdminDataDetail;
