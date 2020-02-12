import React, { Component } from "react";

import { Segment, Button, Input, ButtonGroup, Icon } from "semantic-ui-react";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import firebase from "./../../fibase/firebase";

import FileModal from "./FileModal.component";

import uidv4 from "uuid/v4";

import ProgressBar from "./ProgressBar.component";

export class MessageForm extends Component {
  state = {
    typingRef: firebase.database().ref("typing"),
    errors: [],
    percentUploaded: 0,
    message: "",
    privateChannel: this.props.privateChannel,
    loading: false,
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    modal: false,
    uploadState: "",
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    emojiPicker: false
  };

  openModal = () => {
    this.setState({ modal: true });
  };

  closeModal = () => {
    this.setState({ modal: false });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  //remove event listeners

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadState.cancel();
      this.setState({ uploadTask: null });
    }
  }

  // create message

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };
  // send message

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, typingRef, channel, user } = this.state;

    if (message) {
      // send message
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            loading: false,
            message: "",
            errors: []
          });
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
        })
        .catch(err => {
          this.setState({
            loading: false,
            message: "",
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "add a message" })
      });
    }
  };

  getPath = () => {
    if (this.props.privateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else return "chat/public";
  };
  //upload file model that will pass as props into FileModal

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    // called to swith between private and public messages on MessagePanal.js
    const ref = this.props.getMessagesRef;
    const filePath = `${this.getPath()}/${uidv4()}.jpg`;
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.props.isProgresBarVisible(percentUploaded);

            this.setState({ percentUploaded });
          },
          err => {
            console.log(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },

          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };
  // send file method

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          err: this.state.errors.concat(err)
        });
      });
  };

  // handlekeyDown  for kowing when another users is typing

  handlekeyDown = event => {
    if (event.ctrlKey && event.keyCode === 13) this.sendMessage();

    const { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  // emoji toggle picker

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  //handle Add emoji

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(`
    ${oldMessage} ${emoji.colons}`);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  // called in handleAddEmoji
  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  // redner function
  render() {
    const {
      errors,
      loading,
      message,
      modal,
      percentUploaded,
      uploadState,
      emojiPicker
    } = this.state;
    return (
      <React.Fragment>
        <Segment className="">
          {emojiPicker && (
            <Picker
              onSelect={this.handleAddEmoji}
              set="apple"
              className="emojipicker"
              title="Pick your emoji"
              emoji="point_up"
            />
          )}
          <Input
            className={
              errors.some(error => error.message.includes("message"))
                ? "error"
                : " "
            }
            fluid
            name="message"
            value={message}
            onKeyDown={this.handlekeyDown}
            onChange={this.handleChange}
            style={{ marginBottom: "0.7em" }}
            label={
              <Button
                icon={emojiPicker ? "close" : "add"}
                content={emojiPicker ? "close" : null}
                onClick={this.handleTogglePicker}
              />
            }
            labelPosition="left"
            placeholder="Write your message | ctrl+enter to send your message"
            ref={node => (this.messageInputRef = node)}
          />

          <ButtonGroup icon widths={6}>
            {" "}
            <Button
              disabled={loading}
              onEnterDown={this.sendMessage}
              onClick={this.sendMessage}
              color="orange"
              content="Add Repply"
              labelPosition="left"
              icon="edit"
            />
            {/* Other functionalities to be added in nex update */}
            {/* 1-- voice chat */}
            <Button color="linkedin">
              <Icon name="microphone" />
            </Button>
            {/* video chat */}
            <Button color="instagram">
              <Icon name="video" />
            </Button>
            {/* upload code.  and there must be a specific pannel for code editing */}
            <Button color="facebook">
              <Icon name="codepen" />
            </Button>
            {/*  files such as pdf, docs ... */}
            <Button color="pink">
              <Icon name="photo" />
            </Button>
            {/*  End Other functionalities to be added in nex update */}
            <Button
              color="teal"
              disabled={uploadState === "uploading"}
              content="Upload Media"
              labelPosition="right"
              icon="cloud upload"
              onClick={this.openModal}
            />
          </ButtonGroup>

          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
          <ProgressBar
            uploadState={uploadState}
            percentUploaded={percentUploaded}
          />
        </Segment>
      </React.Fragment>
    );
  }
}

export default MessageForm;
