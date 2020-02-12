import React, { Component } from "react";
import MessagesHeader from "./MessagesHeader.component";
import MessageForm from "./MessageForm.component";
import firebase from "./../../fibase/firebase";
import { Segment, Comment, Image } from "semantic-ui-react";
import { connect } from "react-redux";

import { setUserPosts } from "./../../actions/index.action";
import moment from "moment";
import Typing from "./Typing.component";
import Skeletton from "./Skeletton.messages";

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    messages: [],
    isChannelStarred: false,
    channel: this.props.currentChannel,
    messagesLoading: true,
    progressBar: false,
    numUniqueUsers: "",
    searchTerm: "",
    typingRef: firebase.database().ref("typing"),
    seachLoading: false,
    searchResults: [],
    typingUsers: [],
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    connectedRef: firebase.database().ref(".info/connected"),
    listernes: []
  };

  addToListeners = (id, ref, event) => {
    const index = this.state.listernes.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index !== -1) {
      const newListener = { id, ref, event };
      this.setState({ listernes: this.state.listernes.concat(newListener) });
    }
  };
  removeListerners = listerners => {
    listerners.forEach(listerner => {
      listerner.ref.child(listerner.id).off(listerner);
    });
  };

  componentWillUnmount() {
    this.removeListerners(this.state.listernes);
    this.state.connectedRef.off();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messageEnd) {
      this.scrollToBottom();
    }
  }

  // scroll the messages to the end called in componentdidUpdate

  scrollToBottom = () => {
    this.messageEnd.scrollIntoView({ behavior: "smooth" });
  };
  // display the messages when the component mount

  componentDidMount() {
    const { channel, user, listernes } = this.state;

    if (channel && user) {
      this.removeListerners(listernes);
      this.addListerner(channel.id);
      this.addUserStarsListerner(channel.id, user.uid);
    }
  }
  // it helps not conserve the state of the star even channel changed

  addUserStarsListerner = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelids = Object.keys(data.val());
          const prevStarred = channelids.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  // it will help to listeen when the message is added
  addListerner = channelId => {
    this.addMessagesListerner(channelId);
    this.addTypingListenener(channelId);
  };

  // types lterners

  addTypingListenener = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });

        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_added");
    this.state.typingRef.child(channelId).on("child_removed", snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);

      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_removed");
    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.log(err);
            }
          });
      }
    });
  };

  addMessagesListerner = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();

    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({ messages: loadedMessages, messagesLoading: false });
    });

    this.countUniqueUsers(loadedMessages);
    this.countUserPosts(loadedMessages);
    this.addToListeners(channelId, ref, "child_removed");
  };

  // ref to know witch references should be used to send our messages
  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  // count user post

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  // designing the way the message will be displayed

  isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? "messages__self" : "";
  };

  // Date formating

  timeFromNow = timestamp => moment(timestamp).fromNow();

  // verifcation whether the file is an image or not

  isImage = message => {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  };

  // rendering the progress bar UI
  isProgressBar = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };

  // displaying the channel name method, its take channelId as argument

  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"} ${channel.name}`
      : "";
  };

  //  the methode to handle seach change

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        seachLoading: true
      },
      () => this.handleSearchMessages()
    );
  };
  // handle search message that will provide the message needed
  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];

    const regex = new RegExp(this.state.searchTerm, "gi"); //be globally and case sensibitively;

    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);

    this.setState({ searchResults });
    setTimeout(() => this.setState({ seachLoading: false }), 1000);
  };

  // handle starred channel

  handleStarred = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => this.starredChannel()
    );
  };
  starredChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.channelDetails,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(error => {
          if (error !== null) console.log(error);
        });
    }
  };

  // display users typing informations

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(user => (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ));

  //display skeleton when the messages are not fully loaded

  displayMessagesSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {" "}
        {[...Array(10)].map((_, i) => (
          <Skeletton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  render() {
    const {
      messagesRef,
      user,
      messages,
      channel,
      progressBar,
      numUniqueUsers,
      searchTerm,
      searchResults,
      seachLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          handleStar={this.handleStarred}
          isChannelStarred={isChannelStarred}
          isPrivateChannel={privateChannel}
          seachLoading={seachLoading}
          channelName={this.displayChannelName(channel)} // methode passed as props
          numUniqueUsers={numUniqueUsers} // value from state passe as props
          handleSearchChange={this.handleSearchChange}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}
          >
            {this.displayMessagesSkeleton(messagesLoading)}

            {searchTerm //  display search messages
              ? searchResults.map(searchResult => (
                  <Comment key={searchResult.timestamp}>
                    <Comment.Avatar src={searchResult.user.avatar} />
                    <Comment.Content
                      className={this.isOwnMessage(searchResult, user)}
                    >
                      <Comment.Author as="a">
                        {searchResult.user.name}
                      </Comment.Author>
                      <Comment.Metadata>
                        {this.timeFromNow(searchResult.timestamp)}
                      </Comment.Metadata>
                      {this.isImage(searchResult) ? (
                        <Image
                          src={searchResult.image}
                          className="message__image"
                        />
                      ) : (
                        <Comment.Text>{searchResult.content}</Comment.Text>
                      )}
                    </Comment.Content>
                  </Comment>
                ))
              : messages.length > 0 &&
                messages.map(message => (
                  <Comment key={message.timestamp}>
                    <Comment.Avatar src={message.user.avatar} />
                    <Comment.Content
                      style={{ justifyContent: "justify" }}
                      className={this.isOwnMessage(message, user)}
                    >
                      <Comment.Author as="a">
                        {message.user.name}
                      </Comment.Author>
                      <Comment.Metadata style={{ color: "blue" }}>
                        {this.timeFromNow(message.timestamp)}
                      </Comment.Metadata>
                      {this.isImage(message) ? (
                        <Image src={message.image} className="message__image" />
                      ) : (
                        <Comment.Text>{message.content}</Comment.Text>
                      )}
                    </Comment.Content>
                  </Comment>
                ))}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messageEnd = node)}></div>
          </Comment.Group>
        </Segment>
        <MessageForm
          getMessagesRef={this.getMessagesRef}
          privateChannel={privateChannel}
          isProgresBarVisible={this.isProgressBar}
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
