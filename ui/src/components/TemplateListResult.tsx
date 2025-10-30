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

import TemplateService, {
  Template,
  TemplateListData,
  templateJSON,
} from "../api/TemplateService";
import { TEMPLATES_DETAIL_PATH, TEMPLATES_CREATE_PATH } from "../common/Path";

function createTemplateList(
  uuid: string,
  itemName: string,
  pubTime: string,
  reviewer: string,
  state: string
) {
  return { uuid, itemName, pubTime, reviewer, state };
}

function addTemplates(templateList: Template[]) {
  var tmpRows: TemplateListData[] = [];
  for (var key in templateList) {
    const item: templateJSON = templateList[key].json_schema;
    tmpRows.push(
      createTemplateList(
        templateList[key].id,
        item["title"],
        item["create_timestamp"],
        item["reviewer"],
        item["review_status"]
      )
    );
  }
  return tmpRows;
}

const tableHeadList: TableHeadData[] = [
  { name: "title", width: "350px" },
  { name: "create_timestamp", width: "137px" },
  { name: "reviewer", width: "119px" },
  { name: "review_status", width: "142px" },
  { name: "operation", width: "85px" },
];

const TemplateListResult: React.FC<{ itemType: string }> = ({ itemType }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [backendNotLoaded, setBackendNotLoaded] = useState(1);
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<TemplateListData[]>([]);
  const [filterState, setfilterState] = useState("all");

  const updateList = async (state: string, curPage: number) => {
    const templateListResponse = await TemplateService.getTemplateList(
      state,
      (curPage - 1) * rowsPerPage,
      rowsPerPage
    );
    setRows(addTemplates(templateListResponse["data"]));
    setBackendNotLoaded(templateListResponse["status"]);
  };

  const updatePageCount = async (state: string) => {
    const tmpPageCount: number = await TemplateService.getTemplatesCount(state);
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
      await TemplateService.deleteTemplate(uuid);
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
            CREATE_PATH={TEMPLATES_CREATE_PATH}
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
                    href={TEMPLATES_DETAIL_PATH + "/" + row.uuid}
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
                <StyledTableCell>
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
      <Box display="flex" justifyContent="center" m={1}>
        <ListPagination page={page} pagesCount={pagesCount} setPage={setPage} />
      </Box>
    </Box>
  );
};

export default TemplateListResult;
