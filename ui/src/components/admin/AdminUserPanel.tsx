import React, { useEffect, useState } from "react";
import { Table, TableRow, TableBody, Box, Button } from "@material-ui/core";
import {
  StyledTableHead,
  StyledTableCell,
} from "../ListComponent/TableComponent";
import Common from "../../common/Common";
import LoadingComponent from "../LoadingComponent";
import ListPagination from "../ListComponent/ListPagination";
import {
  updateUserList,
  updateUserPageCount,
  userTableHeadList,
} from "./AdminPageUtil";
import { AdminDelete } from "./AdminDisplayUtil";
import UserService, { UserListData } from "../../api/UserService";
import UserAdd from "../UserAdd";
import Icons from "../Icon";

const AdminUserPanel: React.FC = () => {
  const fontClasses = Common.fontStyles();
  const btnClasses = Common.buttonStyles();

  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [rows, setRows] = useState<UserListData[]>([]);
  const [backendNotLoaded, setBackendNotLoaded] = useState(1);
  const [userAddDialogOpen, setUserAddDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const handleDialogOpen = () => {
    setUserAddDialogOpen(true);
  };
  const handleDialogClose = () => {
    setUserAddDialogOpen(false);
  };

  const handleDelete = async (uuid: string) => {
    try {
      await UserService.deleteUser(uuid);
      updateUserList(page, setRows, setBackendNotLoaded);
      updateUserPageCount(setPagesCount);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        updateUserList(page, setRows, setBackendNotLoaded);
        updateUserPageCount(setPagesCount);
        setUpdateStatus(false);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [updateStatus, page]);

  if (backendNotLoaded) {
    return <LoadingComponent />;
  }

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" flexBasis="768px">
      <Box display="flex" flexDirection="row-reverse">
        <Button
          className={btnClasses.SecondarySmallIcon}
          onClick={handleDialogOpen}
          startIcon={Icons.addIcon}
          disableRipple
        >
          添加用户
        </Button>
        <UserAdd
          openDialog={userAddDialogOpen}
          handleCardClose={handleDialogClose}
          setUpdateStatus={setUpdateStatus}
        />
      </Box>
      <Box m={1} height="620px">
        <Table aria-label="customized table">
          <StyledTableHead
            itemType={"user"}
            tableHeadList={userTableHeadList}
          />
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover key={row.user_number}>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.user_number}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.user_name}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.display_name}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.country}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.organization}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    {row.user_type}
                  </StyledTableCell>
                  <StyledTableCell className={fontClasses.unboldFont}>
                    <AdminDelete
                      uuid={row.user_number}
                      handleDelete={handleDelete}
                      ifUserPanel={true}
                    />
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

export default AdminUserPanel;
