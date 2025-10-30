import { makeStyles, withStyles, createStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem, { TreeItemProps } from "@material-ui/lab/TreeItem";
import Collapse from "@material-ui/core/Collapse";
import { TransitionProps } from "@material-ui/core/transitions";
import Common from "../common/Common";
import Icons, { CloseSquare } from "./Icon";

const aColor = Common.allColor;

function TransitionComponent(props: TransitionProps) {
  return <Collapse {...props} />;
}

export interface RenderTree {
  name: string;
  children?: RenderTree[];
}

const StyledTreeItem = withStyles(() =>
  createStyles({
    iconContainer: {
      "& .close": {
        opacity: 0.3,
      },
    },
    group: {
      marginLeft: 7,
      paddingLeft: 16,
      borderLeft: `1px dashed ${aColor.lightBodyText}`,
    },
  })
)((props: TreeItemProps) => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
));

const useStyles = makeStyles(
  createStyles({
    root: {
      height: "auto",
      flexGrow: 1,
      maxWidth: 264,
    },
  })
);

const OverallTreeView: React.FC<{
  TreeData: RenderTree[];
}> = ({ TreeData }) => {
  const classes = useStyles();

  const renderTree = (nodes: RenderTree[], depth: number) =>
    nodes.map((node, index) => {
      return (
        <StyledTreeItem
          key={node.name + "d:" + depth + "i:" + index}
          nodeId={node.name + "d:" + depth + "i:" + index}
          label={node.name}
        >
          {Array.isArray(node.children)
            ? renderTree(node.children, depth + 1)
            : null}
        </StyledTreeItem>
      );
    });

  return (
    <TreeView
      className={classes.root}
      defaultExpanded={["1"]}
      defaultCollapseIcon={Icons.minusSquare}
      defaultExpandIcon={Icons.plusSquare}
      defaultEndIcon={<CloseSquare />}
    >
      {renderTree(TreeData, 0)}
    </TreeView>
  );
};

export default OverallTreeView;
