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
import { useStyles, rowsPerPage } from "./ListResultUtils";
import {
  TableHeadData,
  StyledTableCell,
  StyledTableHead,
} from "./ListComponent/TableComponent";
import LoadingComponent from "./LoadingComponent";
import ListPagination from "./ListComponent/ListPagination";
import CreateButton from "./ListComponent/CreateButton";

import MGIDApplyService, {
  MGIDApply,
  MGIDListData,
  MGIDApplyJSON,
} from "../api/MGIDApplyService";
import { MGID_DETAIL_PATH, MGID_APPLY_CREATE_PATH } from "../common/Path";
import { getClickableLink } from "./MGIDDetailComponent";

function createMGIDList(
  uuid: string,
  data_title: string,
  author_name: string,
  MGID: string,
  data_url: string
) {
  return { uuid, data_title, author_name, MGID, data_url };
}

function addMGIDs(MGIDList: MGIDApply[]) {
  var tmpRows: MGIDListData[] = [];
  for (var key in MGIDList) {
    const item: MGIDApplyJSON = MGIDList[key].json_data;
    tmpRows.push(
      createMGIDList(
        MGIDList[key].id,
        item["data_title"],
        item["author_name"],
        item["MGID"],
        item["data_url"]
      )
    );
  }
  return tmpRows;
}

const tableHeadList: TableHeadData[] = [
  { name: "data_title", width: "200x" },
  { name: "author_name", width: "100px" },
  { name: "MGID", width: "180px" },
  { name: "data_url", width: "100px" },
];

const MGIDListResult: React.FC<{ itemType: string }> = ({ itemType }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [backendNotLoaded, setBackendNotLoaded] = useState(1);
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<MGIDListData[]>([]);

  const updateList = async (curPage: number) => {
    const MGIDListResponse = await MGIDApplyService.getMGIDList(
      (curPage - 1) * rowsPerPage,
      rowsPerPage
    );
    setRows(addMGIDs(MGIDListResponse["data"]));
    setBackendNotLoaded(MGIDListResponse["status"]);
  };

  const updatePageCount = async () => {
    const tmpPageCount: number = await MGIDApplyService.getMGIDCount();
    const nPages = Math.ceil(tmpPageCount / rowsPerPage);
    setPagesCount(nPages === 0 ? 1 : nPages);
  };

  // loading page
  useEffect(() => {
    void (async () => {
      try {
        updateList(page);
        updatePageCount();
      } catch (e) {
        console.log(e);
      }
    })();
  }, [page]);

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
        <Box display="flex" flexGrow={1} p={0} height="32px"></Box>
        <Box p={0}>
          <CreateButton
            itemType={itemType}
            CREATE_PATH={MGID_APPLY_CREATE_PATH}
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
                    href={MGID_DETAIL_PATH + "/" + row.MGID}
                  >
                    {row.data_title}
                  </Link>
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  {row.author_name}
                </StyledTableCell>
                <StyledTableCell>
                  <Typography
                    className={fontClasses.unboldFont}
                    style={{ wordBreak: "break-all" }}
                  >
                    {row.MGID}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell className={fontClasses.unboldFont}>
                  <Link
                    className={classes.data_url}
                    href={getClickableLink(row.data_url)}
                  >
                    链接地址
                  </Link>
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

export default MGIDListResult;
