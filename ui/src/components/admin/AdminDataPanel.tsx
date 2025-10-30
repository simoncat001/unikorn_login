import React, { useEffect, useState } from "react";
import {
  Table,
  TableRow,
  TableBody,
  makeStyles,
  createStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Link } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { ListStateIcon } from "../Icon";
import ReviewStatusUtils from "../../common/ReviewStatusUtils";
import { ADMIN_DATA_DETAIL_PATH } from "../../common/Path";
import { StyledTableCell } from "../ListComponent/TableComponent";
import Common from "../../common/Common";
import WordService from "../../api/WordService";
import { DevelopmentListData } from "../../api/DevelopmentDataService";
import {
  dataTableHeadList,
  buttonList,
  updateDataList,
  updateDataPageCount,
} from "./AdminPageUtil";
import LoadingComponent from "../LoadingComponent";
import { StyledTableHead } from "../ListComponent/TableComponent";
import ListButtonGroup from "../ListComponent/ListButtonGroup";
import ListPagination from "../ListComponent/ListPagination";
import { AdminDelete } from "./AdminDisplayUtil";
import Map from "../../common/Map";

const aColor = Common.allColor;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      color: aColor.bodyText,
      "&:hover": {
        color: aColor.primaryColor,
        textDecoration: "none",
      },
    },
  })
);

const AdminDataPanel: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [filterState, setfilterState] = useState("all");
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<DevelopmentListData[]>([]);
  const [backendNotLoaded, setBackendNotLoaded] = useState(1);

  const handleDelete = async (uuid: string) => {
    try {
      await WordService.deleteWord(uuid);
      updateDataList(filterState, page, setRows, setBackendNotLoaded);
      updateDataPageCount(filterState, setPagesCount);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        updateDataList(filterState, page, setRows, setBackendNotLoaded);
        updateDataPageCount(filterState, setPagesCount);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [filterState, page]);

  if (backendNotLoaded) {
    return <LoadingComponent />;
  }

  return (
    <Box
      display="flex"
      flexGrow={1}
      flexDirection="column"
      style={{ minWidth: "768px" }}
    >
      <Box display="flex" p={0} m={1} alignItems="center">
        <ListButtonGroup
          btnList={buttonList}
          filterState={filterState}
          setfilterState={setfilterState}
          setPage={setPage}
        />
      </Box>
      <Box m={1} height="620px">
        <Table aria-label="customized table">
          <StyledTableHead
            itemType={"development_data"}
            tableHeadList={dataTableHeadList}
          />
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.uuid}>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    <Link
                      className={classes.link}
                      target="_blank"
                      href={ADMIN_DATA_DETAIL_PATH + "/" + row.uuid}
                    >
                      {row.itemName}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {Map.templateTypeMap[row.templateType]}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.pubTime}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.author!}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    <Box display="flex" alignItems="center">
                      <ListStateIcon state={row.state} />
                      <Typography className={fontClasses.unboldFont}>
                        {ReviewStatusUtils.reviewStatusMap[row.state]}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    <AdminDelete uuid={row.uuid} handleDelete={handleDelete} />
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ListPagination page={page} pagesCount={pagesCount} setPage={setPage} />
      </Box>
    </Box>
  );
};

export default AdminDataPanel;
