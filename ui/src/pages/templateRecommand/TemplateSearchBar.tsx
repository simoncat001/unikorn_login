import React from "react";
import { Container, InputAdornment } from "@material-ui/core";
import { Button, TextField } from "@material-ui/core";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Common from "../../common/Common";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      lineHeight: "20px",
      textAlign: "center",
      position: "relative",
      width: "1000px",
      marginTop: "20px",
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

const TemplateSearchBar: React.FC<SearchBarProps> = ({
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
        
      </div>
    </Container>
  );
};

export default TemplateSearchBar;
