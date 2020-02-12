import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "./../../fibase/firebase";
import {
  setCurrentChannel,
  setPrivateChannel
} from "./../../actions/index.action";

export class Starred extends Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    activeChannel: "",
    starredChannels: []
  };

  //callled in componentWillUnmount to remove all listerners

  removeListerners = () => {
    this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
  };
  componentWillUnmount() {
    this.removeListerners();
  }

  componentDidMount() {
    if (this.state.user) {
      this.addListerners(this.state.user.uid);
    }
  }

  // add leistenres that will ask usersRef to renders its contain

  addListerners = userId => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = {
          id: snap.key,
          ...snap.val()
        };

        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });

    this.state.usersRef.child(userId).on("child_removed", snap => {
      const channelToRemove = { id: snap.key, ...snap.val() };

      const filteredChannels = this.state.starredChannels.filter(channel => {
        return channel.id !== channelToRemove.id;
      });
      this.setState({ starredChannels: filteredChannels });
    });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };
  //display the starred channel
  displayChannel = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
        onClick={() => {
          this.changeChannel(channel);
        }}
        name={channel.name}
      >
        #{channel.name}
      </Menu.Item>
    ));

  render() {
    const { starredChannels } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu>
          <Menu.Item>
            <span>
              <Icon name="star" /> STARRED
            </span>{" "}
            ({starredChannels.length})
          </Menu.Item>
          {this.displayChannel(starredChannels)}
        </Menu.Menu>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);
