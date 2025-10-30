import {
  CheckCircle,
  Cancel,
  Schedule,
  ErrorOutline,
  Feedback,
  KeyboardArrowLeft,
  Add,
  ArrowRight,
  ArrowDropDown,
  AddCircleOutline,
  Edit,
  Home,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
} from "@material-ui/icons";
import IndeterminateCheckBoxOutlinedIcon from "@material-ui/icons/IndeterminateCheckBoxOutlined";
import AddBoxOutlinedIcon from "@material-ui/icons/AddBoxOutlined";
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import Common from "../common/Common";
import {
  REVIEW_STATUS_WAITING_REVIEW,
  REVIEW_STATUS_PASSED_REVIEW_PREVIEW,
  REVIEW_STATUS_PASSED_REVIEW,
  REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED,
  REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW,
  REVIEW_STATUS_REJECTED,
  REVIEW_STATUS_DEPRECATED,
} from "../common/ReviewStatusUtils";

const aColor = Common.allColor;
const iconSize = Common.iconSize;

const successIconSmall = (
  <CheckCircle
    style={{
      color: aColor.positiveFeedback,
      fontSize: iconSize.small,
      marginRight: "8px",
    }}
  />
);
const rejectIconSmall = (
  <Cancel
    style={{
      color: aColor.negativeFeedback,
      fontSize: iconSize.small,
      marginRight: "8px",
    }}
  />
);
const waitIconSmall = (
  <Schedule
    style={{
      color: aColor.primaryDark,
      fontSize: iconSize.small,
      marginRight: "8px",
    }}
  />
);
const deprecatedIconSmall = (
  <CheckCircle
    style={{
      color: aColor.inactive,
      fontSize: iconSize.small,
      marginRight: "8px",
    }}
  />
);

const alertIconSmall = (
  <ErrorOutline style={{ color: aColor.warning, fontSize: iconSize.small }} />
);

const successIcon = (
  <CheckCircle
    style={{ color: aColor.positiveFeedback, fontSize: iconSize.regular }}
  />
);

const deprecatedIcon = (
  <CheckCircle style={{ color: aColor.inactive, fontSize: iconSize.regular }} />
);

const feedbackIcon = (
  <Feedback style={{ color: aColor.warning, fontSize: iconSize.regular }} />
);

const addIcon = (
  <Add style={{ color: aColor.primaryColor, fontSize: iconSize.small }} />
);

const editIcon = (
  <Edit style={{ color: aColor.primaryColor, fontSize: iconSize.small }} />
);

const backIcon = (
  <KeyboardArrowLeft
    style={{ color: aColor.primaryDark, fontSize: iconSize.large }}
  />
);

const arrowRightIconSmall = (
  <ArrowRight style={{ color: aColor.primaryDark, fontSize: iconSize.small }} />
);

const arrowDropDownIconSmall = (
  <ArrowDropDown
    style={{ color: aColor.primaryDark, fontSize: iconSize.small }}
  />
);

const addCircleOutlineSmall = (
  <AddCircleOutline
    style={{ color: aColor.primaryColor, fontSize: iconSize.small }}
  />
);

const homeIconSmall = <Home fontSize="small" style={{ marginTop: "5px" }} />;

const minusSquare = <IndeterminateCheckBoxOutlinedIcon />;

const plusSquare = <AddBoxOutlinedIcon />;

const checkboxIcon = <CheckBox style={{ color: aColor.primaryColor }} />;

const checkboxOutLineIcon = (
  <CheckBoxOutlineBlank style={{ color: aColor.border }} />
);

const closeSmall = (
  <Close
    style={{ color: aColor.seoncdaryBodyText, fontSize: iconSize.small }}
  />
);

export function CloseSquare(props: SvgIconProps) {
  return (
    <SvgIcon
      className="close"
      fontSize="inherit"
      style={{ width: 14, height: 14 }}
      {...props}
    >
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

interface StateProps {
  state: string;
}

export function ListStateIcon(props: StateProps) {
  const state = props.state;
  switch (state) {
    case REVIEW_STATUS_PASSED_REVIEW:
    case REVIEW_STATUS_PASSED_REVIEW_PREVIEW:
    case REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED:
      return successIconSmall;
    case REVIEW_STATUS_REJECTED:
      return rejectIconSmall;
    case REVIEW_STATUS_PASSED_REVIEW_WAITING_REVIEW:
    case REVIEW_STATUS_WAITING_REVIEW:
      return waitIconSmall;
    case REVIEW_STATUS_DEPRECATED:
      return deprecatedIconSmall;
  }
  return null;
}

export function DetailStateIcon(props: StateProps) {
  const state = props.state;
  switch (state) {
    case REVIEW_STATUS_PASSED_REVIEW:
    case REVIEW_STATUS_PASSED_REVIEW_PREVIEW:
    case REVIEW_STATUS_PASSED_REVIEW_WAITING_PUBLISHED:
      return successIcon;
    case REVIEW_STATUS_REJECTED:
      return feedbackIcon;
    case REVIEW_STATUS_DEPRECATED:
      return deprecatedIcon;
  }
  return null;
}

const exportIcons = {
  successIconSmall,
  rejectIconSmall,
  waitIconSmall,
  alertIconSmall,
  deprecatedIconSmall,
  successIcon,
  deprecatedIcon,
  feedbackIcon,
  backIcon,
  addIcon,
  arrowRightIconSmall,
  arrowDropDownIconSmall,
  addCircleOutlineSmall,
  editIcon,
  minusSquare,
  plusSquare,
  homeIconSmall,
  checkboxIcon,
  checkboxOutLineIcon,
  closeSmall,
};

export default exportIcons;
