import React from "react";
import { Container, InputAdornment } from "@material-ui/core";
import { Button, TextField } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Common from "../common/Common";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      lineHeight: "20px",
      textAlign: "center",
      position: "relative",
      width: "1000px",
      marginTop: "51px",
    },
    searchBox: {
      position: "relative",
      width: "572px",
      height: "44px",
      borderRadius: "34px",
      padding: "0px",
    },
    searchBoxInput: {
      padding: "14px",
    },
    searchButton: {
      position: "relative",
      width: "82px",
      height: "44px",
      backgroundColor: Common.allColor.deepBlue,
      borderTopRightRadius: "34px",
      borderBottomRightRadius: "34px",
    },
    checkedControl: {
      margin: "2px",
      position: "relative",
    },
    divControl: {
      margin: "50px",
    },
    formControlLabelControl: {
      marginRight: "40px",
    },
  })
);

export type State = {
  word: boolean;
  templete: boolean;
  studydata: boolean;
  MGID: boolean;
};

export type SearchBarProps = {
  query: string;
  state: State;
  handleClick: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickQueryType: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  state,
  handleClick,
  handleChange,
  handleClickQueryType,
}) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();

  const { word, templete, studydata, MGID } = state;

  return (
    <Container className={classes.container}>
      <div className={classes.divControl}>
        <FormControl>
          <TextField
            id="input-query"
            variant="outlined"
            type="search"
            autoFocus={false}
            value={query}
            onChange={handleChange}
            InputProps={{
              classes: {
                root: classes.searchBox,
                input: classes.searchBoxInput,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    type="submit"
                    className={classes.searchButton}
                    variant="contained"
                    onClick={handleClick}
                  >
                    <div className={fontClasses.BarSearchName}>搜索</div>
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
        <FormControl
          required
          component="fieldset"
          className={classes.checkedControl}
        >
          <FormGroup row>
            <FormControlLabel
              className={classes.formControlLabelControl}
              classes={{ label: fontClasses.CheckboxFont }}
              control={
                <Checkbox
                  checked={word}
                  onChange={handleClickQueryType}
                  name="word"
                  color="primary"
                />
              }
              label="词汇"
            />
            <FormControlLabel
              className={classes.formControlLabelControl}
              classes={{ label: fontClasses.CheckboxFont }}
              control={
                <Checkbox
                  checked={templete}
                  onChange={handleClickQueryType}
                  name="templete"
                  color="primary"
                />
              }
              label="模板"
            />
            <FormControlLabel
              className={classes.formControlLabelControl}
              classes={{ label: fontClasses.CheckboxFont }}
              control={
                <Checkbox
                  checked={studydata}
                  onChange={handleClickQueryType}
                  name="studydata"
                  color="primary"
                />
              }
              label="研发数据"
            />
            <FormControlLabel
              className={classes.formControlLabelControl}
              classes={{ label: fontClasses.CheckboxFont }}
              control={
                <Checkbox
                  checked={MGID}
                  onChange={handleClickQueryType}
                  name="MGID"
                  color="primary"
                />
              }
              label="MGID号"
            />
          </FormGroup>
        </FormControl>
      </div>
    </Container>
  );
};

export default SearchBar;
