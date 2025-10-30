import "./polyfills/process";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from 'react-router-dom';
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// 简化ReactDOM.render以避免样式注入问题，移除StrictMode以避免findDOMNode警告
const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.render(
    React.createElement(
      BrowserRouter as React.ComponentType<any>,
      null,
      React.createElement(App as React.ComponentType<any>)
    ),
    rootElement
  );
} else {
  console.error("无法找到根元素 #root，应用无法挂载");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
