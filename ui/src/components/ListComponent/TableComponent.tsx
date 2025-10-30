import { withStyles } from "@material-ui/core/styles";
import { TableCell, TableRow, TableHead, Typography } from "@material-ui/core";

import Common from "../../common/Common";
import Map from "../../common/Map";

const aColor = Common.allColor;

export type TableHeadData = {
  name: string;
  width: string;
};

export const StyledTableCell = withStyles({
  head: {
    color: aColor.seoncdaryBodyText,
  },
  body: {
    color: aColor.bodyText,
    height: "25px",
  },
})(TableCell);

export const StyledTableHead: React.FC<{
  itemType: string;
  tableHeadList: TableHeadData[];
}> = ({ itemType, tableHeadList }) => {
  const fontClasses = Common.fontStyles();

  function getItemMap(key: string) {
    switch (key) {
      case "words":
        return Map.wordItemMap;
      case "templates":
        return Map.templateItemMap;
      case "development_data":
        return Map.developmentDataItemMap;
      case "MGID_apply":
        return Map.MGIDItemMap;
      case "user":
        return Map.UserItemMap;
      default:
        return Map.developmentDataItemMap;
    }
  }

  const itemMap = getItemMap(itemType);

  return (
    <TableHead>
      <TableRow>
        {tableHeadList.map((tableHeadItem, index) => (
          <StyledTableCell
            key={index}
            align={tableHeadItem.name === "serial_number" ? "center" : "left"}
            style={{
              minWidth: tableHeadItem.width,
            }}
          >
            <Typography className={fontClasses.boldFont}>
              {tableHeadItem.name === "operation"
                ? "操作"
                : itemMap[tableHeadItem.name]}
            </Typography>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
