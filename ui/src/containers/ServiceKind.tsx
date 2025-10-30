import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

// 从上一级目录的icon文件夹导入图标
import TemplateIcon from '../icon/Template.svg';
import StorageIcon from '../icon/Storage.svg';
import SearchIcon from '../icon/Search.svg';
import DownloadIcon from '../icon/Download.svg';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3, 10),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3, 5),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(3, 3),
    },
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    height: 65,
    backgroundColor: '#F7F9FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginLeft: theme.spacing(4), // 增大间距到4倍spacing单位（约32px）
    width: 50,
    height: 50,
  },
  text: {
    marginRight: theme.spacing(1), // 可选：文字右侧也加一点间距
  },
}));

const ServiceCards = () => {
  const classes = useStyles();

  const cards = [
    { text: '数据模板', icon: <img src={TemplateIcon} alt="数据模板" className={classes.icon} /> },
    { text: '数据存储', icon: <img src={StorageIcon} alt="数据存储" className={classes.icon} /> },
    { text: '在线检索', icon: <img src={SearchIcon} alt="在线检索" className={classes.icon} /> },
    { text: '数据下载', icon: <img src={DownloadIcon} alt="数据下载" className={classes.icon} /> },
  ];

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper className={classes.paper} elevation={0}>
              <div className={classes.content}>
                <Typography style={{ fontSize: "18px", fontWeight: 550}} className={classes.text}>
                  {card.text}
                </Typography>
                {card.icon}
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ServiceCards;
