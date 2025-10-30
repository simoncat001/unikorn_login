import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import {
  Storage as DatabaseIcon,
  DataUsage as DatasetIcon,
  Description as TemplateIcon,
  Cloud as ServiceIcon
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    margin: theme.spacing(4, 0),
  },
  panel: {
    width: 'calc(100% - 100px)', // 默认左右各40px页边距
    height: '130px',
    backgroundColor: '#F7F9FB',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    boxSizing: 'border-box',
    [theme.breakpoints.down('md')]: {
      width: 'calc(100% - 60px)', // 中等屏幕减少页边距
    },
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 40px)', // 小屏幕进一步减少页边距
      flexWrap: 'wrap',
      height: 'auto',
      padding: theme.spacing(3, 2),
    },
    [theme.breakpoints.down('xs')]: {
      width: 'calc(100% - 24px)', // 超小屏幕最小页边距
    },
  },
  module: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    padding: theme.spacing(0, 2),
    flex: '1 1 0', // 平均分配空间
    maxWidth: '25%', // 每个模块最大宽度25%
    '&:hover': {
      transform: 'translateY(-5px)',
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: '8px',
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: '50%',
      flex: '1 1 50%',
      marginBottom: theme.spacing(2),
      justifyContent: 'center',
      padding: theme.spacing(0, 1),
    },
    [theme.breakpoints.down('xs')]: {
      maxWidth: '100%',
      flex: '1 1 100%',
      justifyContent: 'flex-start',
    },
  },
  iconContainer: {
    marginRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flexShrink: 0,
  },
  icon: {
    color: '#063E8B',
    fontSize: '28px',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  count: {
    color: '#E99D42',
    fontSize: '20px',
    fontWeight: 'bold',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  label: {
    color: '#333',
    fontSize: '14px',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
  },
}));

function ResourcePanel() {
  const classes = useStyles();
  
  // 模块数据
  const modules = [
    {
      icon: <DatabaseIcon className={classes.icon} />,
      count: '1,458',
      label: '数据库',
    },
    {
      icon: <DatasetIcon className={classes.icon} />,
      count: '1,712',
      label: '高质量数据集',
    },
    {
      icon: <TemplateIcon className={classes.icon} />,
      count: '1,893',
      label: '标准模板',
      href: '/templates/recommend'
    },
    {
      icon: <ServiceIcon className={classes.icon} />,
      count: '20',
      label: '数据服务',
    }
  ];

  return (
    <div className={classes.root}>
      <Box className={classes.panel}>
        {modules.map((module, index) => (
          <a
            key={index}
            href={module.href || '#'}
            className={classes.module}
            style={{ textDecoration: 'none' }}
          >
            <div className={classes.iconContainer}>
              {module.icon}
            </div>
            <div className={classes.textContainer}>
              <Typography variant="h6" className={classes.count}>
                {module.count}
              </Typography>
              <Typography variant="body2" className={classes.label}>
                {module.label}
              </Typography>
            </div>
          </a>
        ))}
      </Box>
    </div>
  );
}

export default ResourcePanel;
