import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableRow,
  Typography,
  Link,
} from "@material-ui/core";
import Common from "../common/Common";
import { ListStateIcon } from "./Icon";
import { useStyles, btnList, rowsPerPage } from "./ListResultUtils";
import ReviewStatusUtils, {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  REVIEW_STATUS_PASSED_REVIEW,
} from "../common/ReviewStatusUtils";
import {
  TableHeadData,
  StyledTableCell,
  StyledTableHead,
} from "./ListComponent/TableComponent";
import LoadingComponent from "./LoadingComponent";
import ListPagination from "./ListComponent/ListPagination";
import ListButtonGroup from "./ListComponent/ListButtonGroup";
import CreateButton from "./ListComponent/CreateButton";
import DeleteComponent from "./ListComponent/DeleteComponent";

import WordService, { Word, WordListData, WordJSON } from "../api/WordService";
import { WORDS_DETAIL_PATH, WORDS_CREATE_PATH } from "../common/Path";

function createWordList(
  uuid: string,
  id: number,
  itemName: string,
  pubTime: string,
  reviewer: string,
  state: string
) {
  return { uuid, id, itemName, pubTime, reviewer, state };
}

function addWords(wordList: Word[]) {
  var tmpRows: WordListData[] = [];
  for (var key in wordList) {
    const item: WordJSON = wordList[key].json_data;
    tmpRows.push(
      createWordList(
        wordList[key].id,
        item["serial_number"],
        item["chinese_name"],
        item["create_timestamp"],
        item["reviewer"],
        item["review_status"]
      )
    );
  }
  return tmpRows;
}

const tableHeadList: TableHeadData[] = [
  { name: "serial_number", width: "80px" },
  { name: "chinese_name", width: "300px" },
  { name: "create_timestamp", width: "137px" },
  { name: "reviewer", width: "119px" },
  { name: "review_status", width: "142px" },
  { name: "operation", width: "85px" },
];

const WordListResult: React.FC<{ itemType: string }> = ({ itemType }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [backendNotLoaded, setBackendNotLoaded] = useState(1);
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<WordListData[]>([]);
  const [filterState, setfilterState] = useState("all");

  const updateList = async (state: string, curPage: number) => {
    const wordListResponse = await WordService.getWordList(
      state,
      (curPage - 1) * rowsPerPage,
      rowsPerPage
    );
    setRows(addWords(wordListResponse["data"]));
    setBackendNotLoaded(wordListResponse["status"]);
  };

  const updatePageCount = async (state: string) => {
    const tmpPageCount: number = await WordService.getWordsCount(state);
    const nPages = Math.ceil(tmpPageCount / rowsPerPage);
    setPagesCount(nPages === 0 ? 1 : nPages);
  };

  // loading page
  useEffect(() => {
    void (async () => {
      try {
        updateList(filterState, page);
        updatePageCount(filterState);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [filterState, page]);

  const handleDelete = async (uuid: string) => {
    try {
      await WordService.deleteWord(uuid);
      updateList(filterState, page);
      updatePageCount(filterState);
    } catch (e) {
      console.log(e);
    }
  };

  if (backendNotLoaded) {
    return <LoadingComponent />;
  }

  return (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="column"
      className={classes.List}
    >
      <Box display="flex" p={0} m={1} alignItems="center">
        <Box display="flex" flexGrow={1} p={0}>
          <ListButtonGroup
            btnList={btnList}
            filterState={filterState}
            setfilterState={setfilterState}
            setPage={setPage}
          />
        </Box>
        <Box p={0}>
          <CreateButton itemType={itemType} CREATE_PATH={WORDS_CREATE_PATH} />
        </Box>
      </Box>
      <Box m={1} height="600px">
        <Table aria-label="customized table">
          <StyledTableHead itemType={itemType} tableHeadList={tableHeadList} />
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.uuid}>
                <StyledTableCell
                  className={fontClasses.unboldFont}
                  align="center"
                >
                  {row.id}
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  <Link
                    className={classes.link}
                    href={WORDS_DETAIL_PATH + "/" + row.uuid}
                  >
                    {row.itemName}
                  </Link>
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  {row.state === REVIEW_STATUS_PASSED_REVIEW ||
                  row.state === REVIEW_STATUS_PASSED_REVIEW_PREVIEW
                    ? row.pubTime
                    : "—"}
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  {row.reviewer}
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  <Box display="flex" alignItems="center">
                    <ListStateIcon state={row.state} />
                    <Typography className={fontClasses.unboldFont}>
                      {row.state === REVIEW_STATUS_DRAFT
                        ? "—"
                        : ReviewStatusUtils.reviewStatusMap[row.state]}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  <DeleteComponent row={row} handleDelete={handleDelete} />
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box display="flex" justifyContent="center">
        <ListPagination page={page} pagesCount={pagesCount} setPage={setPage} />
      </Box>
    </Box>
  );
};

export default WordListResult;
