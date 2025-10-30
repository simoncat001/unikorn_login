import { Button } from "@material-ui/core";
import Icons from "../Icon";
import Common from "../../common/Common";
import Map from "../../common/Map";

const CreateButton: React.FC<{
  itemType: string;
  CREATE_PATH: string;
}> = ({ itemType, CREATE_PATH }) => {
  const btnClasses = Common.buttonStyles();
  return (
    <Button
      className={btnClasses.SecondarySmallIcon}
      href={CREATE_PATH}
      startIcon={Icons.addIcon}
      disableRipple
    >
      {Map.buttonTypeMap[itemType]}
    </Button>
  );
};

export default CreateButton;
