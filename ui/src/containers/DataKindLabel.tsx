import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(10), // 左侧页边距
    marginTop: theme.spacing(2),   // 顶部间距（可选）
    marginBottom: theme.spacing(2) // 底部间距（可选）
  },
  rectangle: {
    width: 20,                    // 矩形宽度
    height: 46,                   // 矩形高度
    backgroundColor: '#063E8B',   // 指定颜色
    marginRight: theme.spacing(4) // 矩形与文字的间距
  },
  text: {
    //fontWeight: 500,              // 中等字体粗细
    color: theme.palette.text.primary
  }
}));

const DataResourceLabel = () => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <div className={classes.rectangle} />
      <Typography style={{ fontSize: "22px", fontWeight: 550}} className={classes.text}>
        数据资源
      </Typography>
    </Box>
  );
};

export default DataResourceLabel;
