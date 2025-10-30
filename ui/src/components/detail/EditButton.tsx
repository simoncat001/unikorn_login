import Common from "../../common/Common";
import { Button } from "@material-ui/core";
import {
  REVIEW_STATUS_DRAFT,
  REVIEW_STATUS_REJECTED,
  REVIEW_STATUS_PASSED_REVIEW,
  REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED,
} from "../../common/ReviewStatusUtils";
import Icon from "../Icon";

const EditButton: React.FC<{
  review_status: string;
  EDIT_PATH: string;
  type?: string;
}> = ({ review_status, EDIT_PATH, type = "" }) => {
  const btnClasses = Common.buttonStyles();

  if (
    review_status === REVIEW_STATUS_REJECTED ||
    review_status === REVIEW_STATUS_DRAFT ||
    ((review_status === REVIEW_STATUS_PASSED_REVIEW ||
      review_status === REVIEW_STATUS_PASSED_REVIEW_PREVIEW ||
      review_status === REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED) &&
      (type === "data" || type === "template"))
  )
    return (
      <Button
        className={btnClasses.SecondarySmallIcon}
        href={EDIT_PATH}
        target="_blank"
        startIcon={Icon.editIcon}
        disableRipple
      >
        编辑
      </Button>
    );
  else return null;
};

export default EditButton;
