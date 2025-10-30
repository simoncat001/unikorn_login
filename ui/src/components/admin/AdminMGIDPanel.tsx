import React, { useEffect, useState } from "react";
import {
  Table,
  TableRow,
  TableBody,
  Box,
  Link,
  makeStyles,
} from "@material-ui/core";
import {
  StyledTableHead,
  StyledTableCell,
} from "../ListComponent/TableComponent";
import Common from "../../common/Common";
import LoadingComponent from "../LoadingComponent";
import ListPagination from "../ListComponent/ListPagination";
import {
  updateMGIDList,
  updateMGIDPageCount,
  MGIDTableHeadList,
} from "./AdminPageUtil";
import { MGIDListData } from "../../api/MGIDApplyService";
import { ADMIN_MGID_DETAIL_PATH } from "../../common/Path";
import { getClickableLink } from "../MGIDDetailComponent";

const useStyles = makeStyles((theme) => ({
  link: {
    color: Common.allColor.bodyText,
    "&:hover": {
      color: Common.allColor.primaryColor,
      textDecoration: "none",
    },
  },
  data_url: {
    color: Common.allColor.primaryColor,
    textDecoration: "underline",
  },
}));

const AdminMGIDPanel: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<MGIDListData[]>([]);
  const [backendNotLoaded, setBackendNotLoaded] = useState(1);

  useEffect(() => {
    void (async () => {
      try {
        updateMGIDList(page, setRows, setBackendNotLoaded);
        updateMGIDPageCount(setPagesCount);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [page]);

  if (backendNotLoaded) {
    return <LoadingComponent />;
  }

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" flexBasis="768px">
      <Box m={1} height="620px">
        <Table aria-label="customized table">
          <StyledTableHead
            itemType="MGID_apply"
            tableHeadList={MGIDTableHeadList}
          />
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.uuid}>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    <Link
                      className={classes.link}
                      href={ADMIN_MGID_DETAIL_PATH + "/" + row.MGID}
                    >
                      {row.data_title}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.pubTime}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.author_name}
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

export default AdminMGIDPanel;
