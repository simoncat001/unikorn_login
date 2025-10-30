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

import DevelopmentDataService, {
  DevelopmentListData,
  DevelopmentData,
  DevelopmentDataJSON,
} from "../api/DevelopmentDataService";
import {
  DEVELOPMENT_DATA_DETAIL_PATH,
  DEVELOPMENT_DATA_CREATE_PATH,
} from "../common/Path";
import Map from "../common/Map";

function createDevDataList(
  uuid: string,
  itemName: string,
  templateType: string,
  pubTime: string,
  reviewer: string,
  state: string
) {
  return { uuid, itemName, templateType, reviewer, pubTime, state };
}

function addDevData(devDataList: DevelopmentData[]) {
  var tmpRows: DevelopmentListData[] = [];
  for (var key in devDataList) {
    const item: DevelopmentDataJSON = devDataList[key].json_data;
    tmpRows.push(
      createDevDataList(
        devDataList[key].id,
        item.title,
        item.template_type,
        item.create_timestamp,
        item.reviewer,
        item.review_status
      )
    );
  }
  return tmpRows;
}

const tableHeadList: TableHeadData[] = [
  { name: "title", width: "240px" },
  { name: "template_type", width: "100px" },
  { name: "create_timestamp", width: "140px" },
  { name: "reviewer", width: "80px" },
  { name: "review_status", width: "142px" },
  { name: "operation", width: "85px" },
];

const DevDataListResult: React.FC<{ itemType: string }> = ({ itemType }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [backendNotLoaded, setBackendNotLoaded] = useState(1);
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<DevelopmentListData[]>([]);
  const [filterState, setfilterState] = useState("all");

  const updateList = async (state: string, curPage: number) => {
    const listResponse = await DevelopmentDataService.getDataList(
      state,
      (curPage - 1) * rowsPerPage,
      rowsPerPage
    );
    setRows(addDevData(listResponse["data"]));
    setBackendNotLoaded(listResponse["status"]);
  };

  const updatePageCount = async (state: string) => {
    const tmpPageCount: number = await DevelopmentDataService.getDataCount(
      state
    );
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
      await DevelopmentDataService.deleteData(uuid);
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
          <CreateButton
            itemType={itemType}
            CREATE_PATH={DEVELOPMENT_DATA_CREATE_PATH}
          />
        </Box>
      </Box>
      <Box m={1} height="600px">
        <Table aria-label="customized table">
          <StyledTableHead itemType={itemType} tableHeadList={tableHeadList} />
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={row.uuid}>
                <StyledTableCell className={fontClasses.unboldFont}>
                  <Link
                    className={classes.link}
                    href={DEVELOPMENT_DATA_DETAIL_PATH + "/" + row.uuid}
                  >
                    {row.itemName}
                  </Link>
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  {Map.templateTypeMap[row.templateType]}
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  {row.pubTime || "—"}
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

export default DevDataListResult;
