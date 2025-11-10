import React, { useState, useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Container, Link } from "@material-ui/core";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import MainAppBar from "../containers/MainAppBar";
import resultComponent from "./search/SearchResult";
import SearchService, { ResultList } from "../api/SearchService";
import SearchBar, { State } from "../containers/SearchBar";
import exportUtils, { sortListElem } from "../common/Utils";
import UserService from "../api/UserService";
import LoadingComponent from "../components/LoadingComponent";
import DataCards from "../containers/DataKind";
import SerViceCards from "../containers/ServiceKind";
import DataResourceLabel from "../containers/DataKindLabel";
import ServiceResourceLabel from "../containers/ServiceKindLabel";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: 0,
      maxWidth: "100%",
      minWidth: "600px",
      maxHeight: "100%",
      minHeight: "950px",
    },
    contentContainer: {
      lineHeight: "20px",
      textAlign: "center",
      position: "relative",
      width: "1000px",
      minHeight: "60px",
      marginTop: "20px",
    },
    copyrightControl: {
      marginTop: "10px",
    },
    outerContainer: {
      display: "flex",
      justifyContent: "center", // 水平居中
      alignItems: "center",    // 垂直居中
      //minHeight: "100vh",      // 至少占满整个视口高度
      //padding: theme.spacing(3), // 添加内边距（可选）
    },
    image: {
      width: 128,           // 固定图片宽度
      height: 128,       // 高度自适应
      [theme.breakpoints.down("sm")]: { // 移动端调整
        width: 100,
      },
      marginRight: "10px",
    },
    iconcontentContainer: {
      display: "flex",
      //flexDirection: ({ isMobile }) => (isMobile ? "column" : "row"), // 响应式方向
      alignItems: "center", // 子元素垂直居中
      maxWidth: 800,        // 限制内容最大宽度（可选）
      margin: theme.spacing(4), // 元素间距（Material-UI v5语法，v4需替换）
      marginTop: "80px",
      marginRight: "50px",
    },
  })
);

function searchResultCount(resultList: ResultList) {
  return (
    resultList.wordResultList.length +
    resultList.templateResultList.length +
    resultList.dataResultList.length +
    resultList.MGIDResultList.length
  );
}

const Homeicon: React.FC = () => {
  const isMobile = window.innerWidth < 600; // 简单响应式判断
  const classes = useStyles({ isMobile });

  return (
    <Box className={classes.outerContainer}>
      <Box className={classes.iconcontentContainer}>
        {/* 左边图片 */}
        <img
          src="./homelogo.png" 
          alt="首页图标"
          className={classes.image}
        />
        {/* 右边文字 */}
        <Box>
          <Typography style={{ fontSize: "46px", fontWeight: 530}} gutterBottom align="center"> 
            材料基因组标准数据库
          </Typography>
          <Typography style={{ fontSize: "26px", fontWeight: 530 }} paragraph align="center">
            Materials Genome Standard Database
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const Copyright: React.FC = () => {
  const classes = useStyles();

  return (
    <Container className={classes.copyrightControl}>
      <Typography variant="body2" align="center">
        <Link
          href="https://beian.miit.gov.cn/"
          target="_blank"
          color="textSecondary"
        >
          沪交ICP备20210259
        </Link>
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        {"© "}
        {new Date().getFullYear()} Materials Genome Standard Database, All
        rights reserved.
      </Typography>
    </Container>
  );
};

//TODO: different offset for different types
const Home: React.FC = () => {
  const classes = useStyles();
  const SearchResult = resultComponent.SearchResult;
  const [query, setQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLastCardVisible, setLastCardVisible] = useState(false);
  const [queryStart, setQueryStart] = useState(0);
  const [queryStartLast, setQueryStartLast] = useState(0);
  const [continueSearch, setContinueSearch] = useState(false);
  const [resultMergedList, setResultMergedList] = useState<sortListElem[]>([]);
  const [state, setState] = useState<State>({
    word: true,
    templete: false,
    studydata: false,
    MGID: false,
  });

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

  const handleClick = async () => {
    const queryType: string[] = exportUtils.getQueryTypeList(state);
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
    const checkLogin = await UserService.isLoggedIn();
    setLoggedIn(checkLogin);
  };

  const handleClickQueryType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
    setIsClicked(false);
    setContinueSearch(false);
  };

  return (
    <Container className={classes.root}>
      <MainAppBar />
      
      <Homeicon />

      <SearchBar
        query={query}
        state={state}
        handleClick={handleClick}
        handleChange={handleChange}
        handleClickQueryType={handleClickQueryType}
      />
      <Container className={classes.contentContainer}>
        <SearchResult
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
      
      <DataResourceLabel />

      <DataCards />

      <ServiceResourceLabel />

      <SerViceCards />
      
      <Box display="flex" alignItems="flex-end" justifyContent="center" p={1}>
        <Box p={1}>
          <Copyright />
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
