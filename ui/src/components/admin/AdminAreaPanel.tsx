import React, { useEffect, useState } from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  makeStyles,
  Theme,
  Typography,
  Box,
} from "@material-ui/core";
import { StyledTableCell } from "../ListComponent/TableComponent";
import {
  updateAreaList,
  updateAreaPageCount,
  areaButtonList,
} from "./AdminPageUtil";
import Common from "../../common/Common";
import LoadingComponent from "../LoadingComponent";
import ListPagination from "../ListComponent/ListPagination";
import { AdminDelete } from "./AdminDisplayUtil";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import OrganizationService, {
  Organization,
} from "../../api/OrganizationService";
import CountryService, { Country } from "../../api/CountryService";
import ReviewStatusUtils from "../../common/ReviewStatusUtils";
import AdminUpdateCode from "../AdminUpdateCodeWithFile";

const useStyles = makeStyles((theme: Theme) => ({
  labelBtn: {
    width: "100px",
    padding: "4px",
    border: "1.8px solid",
    borderColor: Common.allColor.lighterBorder,
    color: Common.allColor.bodyText,
  },
}));

const AdminAreaPanel: React.FC = () => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const [area, setArea] = useState("country");
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<Country[] | Organization[]>([]);
  const [backendNotLoaded, setBackendNotLoaded] = useState(1);
  const [updateStatus, setUpdateStatus] = useState(false);

  const handleDelete = async (uuid: string) => {
    try {
      if (area === "country") {
        await CountryService.deleteCountry(uuid);
      } else {
        await OrganizationService.deleteOrganization(uuid);
      }
      updateAreaList(area, page, setRows, setBackendNotLoaded);
      updateAreaPageCount(area, setPagesCount);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        updateAreaList(area, page, setRows, setBackendNotLoaded);
        updateAreaPageCount(area, setPagesCount);
        setUpdateStatus(false);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [updateStatus, area, page]);

  if (backendNotLoaded) {
    return <LoadingComponent />;
  }

  const handleFilter = async (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    area: string
  ) => {
    if (area) {
      setArea(area);
      setPage(1);
    }
  };

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" flexBasis="768px">
      <Box
        display="flex"
        p={0}
        m={1}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box display="flex">
          <ToggleButtonGroup value={area} onChange={handleFilter} exclusive>
            {areaButtonList.map((elem) => {
              return (
                <ToggleButton
                  className={classes.labelBtn}
                  style={{
                    color: area === elem ? "white" : Common.allColor.bodyText,
                    backgroundColor:
                      area === elem
                        ? Common.allColor.primaryColor
                        : "transparent",
                  }}
                  value={elem}
                  key={elem}
                  disableRipple
                >
                  <Typography
                    className={fontClasses.unboldFont}
                    style={{
                      color:
                        elem === area
                          ? "white"
                          : Common.allColor.darkGreyBodyText,
                    }}
                  >
                    {ReviewStatusUtils.buttonAreaMap[elem]}
                  </Typography>
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Box>
        <Box display="flex">
          <AdminUpdateCode
            isCountry={area === "country" ? true : false}
            setUpdateStatus={setUpdateStatus}
          />
        </Box>
      </Box>
      <Box m={1} height="620px">
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell className={fontClasses.boldFont}>
                {ReviewStatusUtils.buttonAreaMap[area]}
              </StyledTableCell>
              <StyledTableCell className={fontClasses.boldFont}>
                编号
              </StyledTableCell>
              <StyledTableCell className={fontClasses.boldFont}>
                操作
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.id}>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.name}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.id}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    <AdminDelete uuid={row.id} handleDelete={handleDelete} />
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

export default AdminAreaPanel;
