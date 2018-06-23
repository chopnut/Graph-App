import "semantic-ui-css/semantic.min.css";
import "./src/scss/app.scss";

import React from "react";
import ReactDOM from "react-dom";
import Layout from "./src/react/Layout";
import { Route, HashRouter, hashHistory } from "react-router-dom";

const RouterContainer = () => (
  <HashRouter history={hashHistory}>
    <Route path="/" render={props => <Layout {...props} />} />
  </HashRouter>
);
ReactDOM.render(<RouterContainer />, document.getElementById("app"));
