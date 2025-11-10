import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ObjectFieldTemplateProps } from "@rjsf/core";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formBox: {
      display: "flex",
      width: "700px",
      flexWrap: "wrap",
      marginTop: "23px",
    },
    formItemBox: {
      width: "201px",
      marginLeft: "29px",
      marginTop: "23px",
    },
  })
);

function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const classes = useStyles();
  return (
    <Box className={classes.formBox}>
      {props.properties.map((item, index) => (
        <Box className={classes.formItemBox} key={index}>
          {item.content}
        </Box>
      ))}
    </Box>
  );
}

function ObjectFieldTemplateNumberRange(props: ObjectFieldTemplateProps) {
  const start_box = props.properties[0].content;
  const end_box = props.properties[1].content;

  return (
    <Box display="flex" alignItems="center">
      <Box>{start_box}</Box>
      <Box margin="15px 3px 0px 3px">
        <Typography> ~ </Typography>
      </Box>
      <Box>{end_box}</Box>
    </Box>
  );
}

const ApplicationObjectFieldTemplate = {
  ObjectFieldTemplate,
  ObjectFieldTemplateNumberRange,
};

export default ApplicationObjectFieldTemplate;
