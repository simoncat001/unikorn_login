import React, { useState, useEffect } from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Common from "../common/Common";
//import FormControl from "@material-ui/core/FormControl";
//import FormGroup from "@material-ui/core/FormGroup";
//import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Container } from "@material-ui/core";
//import { Button, TextField } from "@material-ui/core";
import TemplateSearchBar, { State } from "../pages/templateRecommand/TemplateSearchBar";
import SearchService, { ResultList } from "../api/SearchService";
import exportUtils, { sortListElem } from "../common/Utils";
//import UserService from "../api/UserService";
import templateResultComponent from "../pages/templateRecommand/TemplateSearchResult";
import LoadingComponent from "../components/LoadingComponent";
import { Link as RouterLink } from 'react-router-dom';
import {
  TEMPLATES_CREATE_PATH,
} from "../common/Path";

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      lineHeight: "20px",
      textAlign: "center",
      position: "relative",
      width: "1000px",
      marginTop: "20px",
    },
    stepper: {
      width: "369px",
      margin: "0 auto",
      padding: "0",
    },
    mainPart: {
      marginTop: "62px",
    },
    contentContainer: {
      lineHeight: "20px",
      textAlign: "center",
      position: "relative",
      width: "1000px",
      minHeight: "50px",
      marginTop: "20px",
    },
  })
);

function searchResultCount(resultList: ResultList) {
  return (
    //resultList.wordResultList.length +
    resultList.templateResultList.length
    //resultList.dataResultList.length +
    //resultList.MGIDResultList.length
  );
}

const TemplateRecommandComponent: React.FC<{ id?: string; isEdit: boolean}> = ({
  id = "",
  isEdit,
}) => {

  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  
  // 创建兼容的RouterLink组件来解决类型错误
  const LinkCompat: React.ComponentType<any> = (RouterLink as unknown) as React.ComponentType<any>;
  
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({
      word: false,
      templete: true,
      studydata: false,
      MGID: false,
    });
  const [isLastCardVisible, setLastCardVisible] = useState(false);
  const [continueSearch, setContinueSearch] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [resultMergedList, setResultMergedList] = useState<sortListElem[]>([]);
  const [queryStart, setQueryStart] = useState(0);
  const [queryStartLast, setQueryStartLast] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const TemplateSearchResult = templateResultComponent.TemplateSearchResult;
  const [loggedIn, setLoggedIn] = useState(false);
  

  useEffect(() => {
    void (async () => {
      const queryType: string[] = exportUtils.getQueryTypeList(state);
      if (
        isLastCardVisible &&
        continueSearch &&
        queryStart !== queryStartLast
      ) {
        const searchList: ResultList = await SearchService.getQuery(
          query,
          queryType,
          queryStart,
          queryType.length !== 0 ? Math.ceil(10 / queryType.length) : 0
        );
        const listCount: number = searchResultCount(searchList);
        if (listCount > 0) {
          setContinueSearch(true);
          const newSearchMergedList = exportUtils.mergeSearchList(searchList);
          setResultMergedList((oldResultMergedList) => {
            return oldResultMergedList.concat(newSearchMergedList);
          });
        } else {
          setContinueSearch(false);
        }
        setQueryStartLast(queryStart);
        setQueryStart((oldStart) => {
          return oldStart + Math.ceil(10 / queryType.length);
        });
      }
    })();
  }, [
    isLastCardVisible,
    continueSearch,
    state,
    queryStart,
    queryStartLast,
    query,
  ]);


  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setIsClicked(false);
    setContinueSearch(false);
  };

  //点击搜索按钮对应处理方式
  const handleClick = async () => {
    const queryType: string[] = exportUtils.getQueryTypeList(state);
    //调用getQuery函数，/api/unauth/search/接口，获得搜索结果
    const searchList: ResultList = await SearchService.getQuery(
      query,
      queryType,
      0,
      queryType.length !== 0 ? Math.ceil(10 / queryType.length) : 0
    );
    setResultMergedList(exportUtils.mergeSearchList(searchList));
    setIsClicked(true);
    setContinueSearch(true);
    setQueryStart(
      queryType.length !== 0 ? Math.ceil(10 / queryType.length) : 0
    );
    setQueryStartLast(0);
    const listCount: number = searchResultCount(searchList);
    if (listCount > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      setContinueSearch(false);
    }
    //const checkLogin = await UserService.isLoggedIn();
    setLoggedIn(true);
  };

  const handleClickQueryType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
    setIsClicked(false);
    setContinueSearch(false);
  };

  return (

    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center">

      <Box display="flex" marginTop="94px">
        <Typography
          component="h1"
          variant="h6"
          className={fontClasses.WordCreatetitle}
        >
          数据模板推荐
        </Typography>
      </Box>

      <Box display="flex" marginTop="20px">
        <Typography
          component="h1"
          variant="h6"
          className={fontClasses.WordCreatetitle}
        >
          您可以输入数据的关键信息，如实验数据的设备：纳米压痕，系统将自动为您匹配模板
        </Typography>
      </Box>

      <Box display="flex" marginTop="20px">
        <Typography
          component="h1"
          variant="h6"
          className={fontClasses.WordCreatetitle}
        >
          若现有模板不合适，您可以前往
          <LinkCompat to={TEMPLATES_CREATE_PATH} style={{ textDecoration: 'none' }}>
            <Typography
              variant="h6"
              className={fontClasses.WordCreatetitle}
              color="primary"
              style={{ 
                marginLeft: '4px',
                textDecoration: 'underline',
                cursor: 'pointer',
                display: 'inline'
              }}
            >
              创建新模板
            </Typography>
          </LinkCompat>
          
        </Typography>
      </Box>

      <TemplateSearchBar
        query={query}
        state={state}
        handleClick={handleClick}
        handleChange={handleChange}
        handleClickQueryType={handleClickQueryType}
      />
      <Container className={classes.contentContainer}>
        <TemplateSearchResult
          resultMergedList={resultMergedList}
          isLoaded={isLoaded}
          isClicked={isClicked}
          isAuthed={loggedIn}
          query={query}
          setLastCardVisible={setLastCardVisible}
        />
      </Container>
      {queryStart !== queryStartLast && continueSearch ? (
        <LoadingComponent />
      ) : null}

    </Box>

  );

};

export default TemplateRecommandComponent;
