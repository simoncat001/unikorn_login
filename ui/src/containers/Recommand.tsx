import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Box, Typography } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '60px',
    backgroundColor: '#F7F9FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
    },
  },
  title: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginRight: theme.spacing(3),
    color: '#333',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  link: {
    fontSize: '16px',
    color: '#333',
    margin: theme.spacing(0, 2),
    padding: theme.spacing(0.5, 0),
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
  },
  separator: {
    height: '30px',
    width: '2px', // 加粗竖线
    backgroundColor: '#D1D5DB',
    margin: theme.spacing(0, 2),
  },
}));

function RecommendedResources() {
  const classes = useStyles();
  
  // 资源数据，包含显示文本和链接
  const resources = [
    { text: '高质量数据库', href: '/center/development_data' },
    { text: '标准模板库', href: '/templates/recommend' },
    { text: '数据汇交', href: '/development_data/create' }
  ];

  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <Box className={classes.content}>
          <Typography variant="body1" className={classes.title}>
            推荐资源：
          </Typography>
          
          {/* 第一个资源项 - 没有竖线 */}
          <span className={classes.item}>
            <a 
              href={resources[0].href} 
              className={classes.link}
              style={{ textDecoration: 'none' }}
            >
              {resources[0].text}
            </a>
          </span>
          
          {/* 分隔线和其余资源项 */}
          {resources.slice(1).map((resource, index) => (
            <React.Fragment key={index}>
              <div className={classes.separator} />
              <span className={classes.item}>
                <a 
                href={resource.href} 
                className={classes.link}
                style={{ textDecoration: 'none' }}
              >
                {resource.text}
              </a>
              </span>
            </React.Fragment>
          ))}
        </Box>
      </Container>
    </div>
  );
}

export default RecommendedResources;
