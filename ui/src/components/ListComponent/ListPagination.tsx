import { Pagination } from "@material-ui/lab";

const ListPagination: React.FC<{
  page: number;
  pagesCount: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ page, pagesCount, setPage }) => {
  // re-read data at new page
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  return (
    <Pagination
      count={pagesCount}
      page={page}
      shape="rounded"
      size="small"
      onChange={handleChangePage}
    />
  );
};

export default ListPagination;
