import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    height: '360px',
    backgroundImage: 'url(/images/background.png)', // 使用本地图片路径
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // 添加半透明遮罩增强文字可读性
    }
  },
  textContainer: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    color: 'white',
    padding: theme.spacing(0, 2),
  },
  firstLine: {
    fontSize: '46px',
    fontWeight: 'bold',
    lineHeight: 1.2,
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('md')]: {
      fontSize: '48px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '36px',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '28px',
    },
  },
  secondLine: {
    fontSize: '26px',
    lineHeight: 1.2,
    [theme.breakpoints.down('md')]: {
      fontSize: '28px',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '24px',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '20px',
    },
  },
}));

function ImageBanner() {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.textContainer}>
        <div className={classes.firstLine}>
          苏州实验室材料科学数据枢纽中心
        </div>
        <div className={classes.secondLine}>
          一站式材料科研数据平台
        </div>
      </div>
    </div>
  );
}

export default ImageBanner;
