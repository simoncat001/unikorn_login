import React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Common from "../common/Common";
const aColor = Common.allColor;
const useListComponentStyles = makeStyles((theme) => ({
  root: {
    height: "46px",
    width: "250px",
    paddingLeft: theme.spacing(2),
  },
  icon: {
    marginLeft: "15px",
    minWidth: "35px",
  },
  selected: {
    backgroundColor: `${aColor.lightFill} !important`,
    color: aColor.primaryColor,
  },
}));
const effectStyles = makeStyles((theme: Theme) =>
  createStyles({
    SelectedEffectLocation: {
      width: "2px",
    },
    SelectedEffect: {
      height: "46px",
      width: "2px",
      marginLeft: "28px",
    },
  })
);
type ListComponentProps = {
  title: string;
  href: string;
  path: string;
  section: boolean;
  Icon?: object;
} & ListItemProps;
const ListComponent: React.FC<ListComponentProps> = ({
  path,
  title,
  href,
  Icon,
  section,
  ...props
}) => {
  const classes = useListComponentStyles(props);
  const effectclasses = effectStyles();
  const fontclasses = Common.fontStyles();
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  return (
    <ListItem
      button
      className={classes.root}
      onClick={() => {
        window.location.href = href;
      }}
      classes={{ selected: classes.selected }}
      selected={currentPath.startsWith(path)}
    >
      <ListItemIcon className={classes.icon}>{Icon}</ListItemIcon>
      <ListItemText>
        <Typography
          className={
            section || currentPath.startsWith(path)
              ? fontclasses.boldFont
              : fontclasses.unboldFont
          }
          style={{
            color: currentPath.startsWith(path)
              ? aColor.primaryColor
              : aColor.bodyText,
          }}
        >
          {title}
        </Typography>
      </ListItemText>
      <ListItemIcon className={effectclasses.SelectedEffectLocation}>
        <div
          className={effectclasses.SelectedEffect}
          style={
            currentPath.startsWith(path)
              ? { backgroundColor: aColor.primaryColor }
              : { backgroundColor: "transparent" }
          }
        />
      </ListItemIcon>
    </ListItem>
  );
};
export default ListComponent;
