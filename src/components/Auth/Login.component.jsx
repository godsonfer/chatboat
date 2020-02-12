import React, { Component } from "react";
import { Link } from "react-router-dom";
import Typed from "react-typed";

// firebase calling

import firebase from "./../../fibase/firebase";

//semantic-ui-react stoffs
import {
  Grid,
  Form,
  Segment,
  Header,
  Message,
  Icon,
  Button
} from "semantic-ui-react";

// classe component

class Login extends Component {
  state = {
    email: "",
    password: "",
    errors: "",
    passwordError: "",
    emailError: "",
    loading: false
  };

  //fonction for handling changes in the forms

  // validation of our forms

  isFormValidate = () => {};

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  // testing if forms empty

  // function for submiting the form to be subscribed to firebase
  handleSubmit = event => {
    event.preventDefault();
    if (this.state.email === "" && this.state.password === "") {
      this.setState({ errors: "Please enter your email and password" });
    } else {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedUser => {
          if (!signedUser.user.emailVerified) {
            signedUser.user.sendEmailVerification();

            this.setState({
              loading: false,
              errors: "A link was sent please confirm your email before login"
            });
          } else {
            this.setState({
              loading: true
            });
          }
        })
        .catch(error => {
          if (error.code === "auth/user-not-found")
            this.setState({
              loading: false,
              errors:
                "There is no user record corresponding to this identifier. Please provide correct one !",
              emailError: "There is not"
            });
          else if (error.code === "auth/wrong-password")
            this.setState({
              loading: false,
              errors: "Sorry, your password is incorrect.  Try again !",
              passwordError: "error on password"
            });
        });
    }
  };

  render() {
    //destructuring of our
    const {
      email,
      password,
      errors,
      loading,
      emailError,
      passwordError
    } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column width={4}>
          <Header as="h2" color="brown">
            <Typed
              strings={["   WELCOME AMOUNG US DEAR MEMBER."]}
              typeSpeed={500}
            />

            <Header.Subheader
              className="type__class_css"
              style={{ color: "blue" }}
            >
              <Typed
                strings={[
                  "Here, we talk about family's issue",
                  "Here, we talk about class's issue",
                  "Here, we talk about friendship's issue",
                  "Here, we talk about patnerships' issue",
                  "Here, we talk about class's issue",
                  "Here, we talk about code's issue",
                  "Here, we talk, but no injuries, insults"
                ]}
                typeSpeed={40}
                backSpeed={50}
                loop
              />
            </Header.Subheader>
          </Header>
        </Grid.Column>

        <Grid.Column width={8} style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="violet" textAlign="center">
            <Icon name="comment" />
            GET LOGIN TO START CHATING
          </Header>

          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                value={email} // the value should be setted
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email"
                onChange={this.handleChange}
                type="email"
                className={emailError.length > 0 ? "error" : ""}
              />

              <Form.Input
                fluid
                value={password}
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                type="password"
                className={passwordError.length > 0 ? "error" : ""}
              />

              <Button
                color="orange"
                fluid
                size="large"
                className={loading ? "loading" : ""}
                disabled={loading}
              >
                Validate
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h6>{errors} </h6>
            </Message>
          )}
          <Message>
            AVEZ VOUS UN COMPTE ? <Link to="/register">INSCRIPTION</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
export default Login;
