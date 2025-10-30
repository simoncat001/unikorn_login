import { makeStyles, createStyles } from "@material-ui/core/styles";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { Typography } from "@material-ui/core";

import Common from "../../common/Common";
import ReviewStatusUtils, {
  REVIEW_STATUS_DRAFT,
} from "../../common/ReviewStatusUtils";

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
  createStyles({
    labelBtn: {
      width: "90px",
      padding: "4px",
      border: `1.8px solid ${aColor.lighterBorder}`,
    },
  })
);

const ListButtonGroup: React.FC<{
  btnList: string[];
  filterState: string;
  setfilterState: React.Dispatch<React.SetStateAction<string>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ btnList, filterState, setfilterState, setPage }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const handleFilter = async (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    state: string
  ) => {
    if (state) {
      // not null
      setfilterState(state);
      setPage(1); // reset
    }
  };

  return (
    <ToggleButtonGroup value={filterState} onChange={handleFilter} exclusive>
      {btnList.map((state) => {
        const fState =
          state === REVIEW_STATUS_DRAFT
            ? "未提交"
            : ReviewStatusUtils.reviewStatusMap[state];
        return (
          <ToggleButton
            className={classes.labelBtn}
            style={{
              backgroundColor:
                filterState === state ? aColor.primaryColor : "transparent",
            }}
            value={state}
            key={state}
            disableRipple
          >
            <Typography
              className={fontClasses.unboldFont}
              style={{
                color:
                  filterState === state ? "white" : aColor.darkGreyBodyText,
              }}
            >
              {fState}
            </Typography>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default ListButtonGroup;
