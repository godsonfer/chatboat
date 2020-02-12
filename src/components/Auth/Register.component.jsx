import React, { Component } from "react";
import { Link } from "react-router-dom";
import md5 from "md5";
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

class Register extends Component {
  state = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    errors: [],
    passwordError: "",
    emailError: "",
    loading: false,
    usersRef: firebase.database().ref("users")
  };

  //fonction for handling changes in the forms

  // validation of our forms

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  // testing if forms empty

  // function for submiting the form to be subscribed to firebase
  handleSubmit = event => {
    if (
      this.state.username === "" ||
      this.state.email === "" ||
      this.state.password === ""
    ) {
      this.setState({ errors: "Please fill all inputs" });
    } else if (this.state.password.length < 7) {
      this.setState({
        errors: "The password must be more than 7 characters",
        passwordError: "Error"
      });
      console.log("fill passwords");
    } else if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        errors: "The two passwords must be the same",
        passwordError: "Error"
      });
    } else {
      this.setState({ errors: [], loading: true });
      event.preventDefault(); // the default action
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password) // the email and password provided by user
        .then(createdUser => {
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              createdUser.user.sendEmailVerification();
              console.log(createdUser.user.emailVerified);
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                console.log("User saved");
              });
            })
            .then(() => this.setState({ loading: false }))
            .catch(err => {
              this.setState({ errors: err, loading: false });
            });
          console.log(createdUser);
        })
        .catch(errors => {
          console.log(errors);
          if (errors.code === "auth/invalid-email")
            this.setState({
              emailError: "Your email is not formated properly.",
              errors: " Your email is not formated properly."
            });
          if (errors.code === "auth/email-already-in-use")
            this.setState({
              emailError: "Your email is already in use by another account.",
              errors: " Your email is already in use by another account"
            });

          this.setState({ loading: false });
        });
    }
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      email: createdUser.user.email,
      avatar: createdUser.user.photoURL,
      createdDate: Date()
    });
  };

  render() {
    //destructuring of our
    const {
      username,
      email,
      password,
      confirmPassword,
      errors,
      loading,
      emailError,
      passwordError
    } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column width={4}>
          <Header as="h2" color="orange">
            <Typed strings={["HAPPY TO KNOW YOU ARE HERE"]} typeSpeed={500} />

            <Header.Subheader
              className="type__class_css"
              style={{ color: "blue" }}
            >
              <Typed
                strings={[
                  "Register to talk with friends",
                  "Register to talk with parents",
                  "Register to talk with colleagues",
                  "Register to talk with us"
                ]}
                typeSpeed={40}
                backSpeed={50}
                loop
              />
            </Header.Subheader>
          </Header>
        </Grid.Column>

        <Grid.Column style={{ maxWidth: 450 }} width={8}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="comment alternate outline" />
            Register for chat
          </Header>

          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                value={username}
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                type="text"
              />

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

              <Form.Input
                value={confirmPassword}
                fluid
                name="confirmPassword"
                icon="repeat"
                iconPosition="left"
                placeholder="Confirm your password"
                onChange={this.handleChange}
                className={passwordError.length > 0 ? "error" : ""}
                type="password"
              />

              <Button
                color="orange"
                fluid
                size="large"
                className={loading ? "loading" : ""}
                disabled={loading}
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h6>{errors} </h6>
            </Message>
          )}
          <Message>
            Already a user ? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
export default Register;
