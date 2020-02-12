import React from "react";
import ReactDOM from "react-dom";
import firebase from "./fibase/firebase";

import App from "./App";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import * as serviceWorker from "./serviceWorker";

//routes of login and register

import Login from "./components/Auth/Login.component";
import Register from "./components/Auth/Register.component";

//redux

import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import RootReducer from "./reducers/index.reducer";
import { setUser, clearUser } from "./actions/index.action";
//semantic UI stoff
// import { Provider as Provide, themes } from "@fluentui/react";
import "semantic-ui-css/semantic.min.css";
import Spinner from "./Spinner.isLoading";

//laoder or spinner

const store = createStore(RootReducer, composeWithDevTools());
class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user != null && user.emailVerified) {
        // User is signed in. redirect to home
        this.props.setUser(user);
        this.props.history.push("/");
      } else {
        this.props.history.push("/login");
        this.props.clearUser();
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
      </Switch>
    );
  }
}
const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
});

const RootWithAuth = withRouter(
  connect(mapStateFromProps, { setUser, clearUser })(Root)
);
ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,

  document.getElementById("root")
);

serviceWorker.unregister();
