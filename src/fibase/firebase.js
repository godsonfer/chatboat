import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// TODO : Initalisation of firebase.

var firebaseConfig = {
  apiKey: "AIzaSyCDTzkmHd344FxwwPdkHyJutOAdMncsL80",
  authDomain: "react-slack-clone-83e1a.firebaseapp.com",
  databaseURL: "https://react-slack-clone-83e1a.firebaseio.com",
  projectId: "react-slack-clone-83e1a",
  storageBucket: "react-slack-clone-83e1a.appspot.com",
  messagingSenderId: "842222222218",
  appId: "1:842222222218:web:0f93c60d1dee8d03b1a673"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
