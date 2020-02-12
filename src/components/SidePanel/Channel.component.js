import React, { Component } from "react";
import firebase from "./../../fibase/firebase";

import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label
} from "semantic-ui-react";

// redux
import {
  setCurrentChannel,
  setPrivateChannel
} from "../../actions/index.action";
import { connect } from "react-redux";

class Channel extends Component {
  state = {
    typingRef: firebase.database().ref("typing"),
    channels: [],
    channel: null,
    modal: false,
    user: this.props.currentUser,
    channelName: "",
    channelDetails: "",
    nameError: "",
    errors: [],
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    channelRef: firebase.database().ref("channels"),
    detailsErrors: "",
    firstLoad: true,
    activeChannel: ""
  };

  //remove every listerners

  removeListerners = listerners => {
    this.state.channelRef.off();

    this.state.channels.forEach(channel => {
      this.state.messagesRef.chil(channel.id).off();
    });
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.state.channelRef.off();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelRef.on("child_added", snap => {
      loadedChannels.push(snap.val());

      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListerner(snap.key);
    });
  };

  // notification listener
  addNotificationListerner = channelId => {
    this.state.messagesRef.child(channelId).on("value", snap => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };
  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      notification => notification === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      });
    }

    this.setState({ notifications });
  };

  // set first channel so that there will need to refresh

  setFirstChannel = () => {
    //load the first channe

    const firstChannel = this.state.channels[0];

    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }

    this.setState({ firstLoad: false });
  };
  // open the model
  openModal = () => {
    this.setState({ modal: true });
  };
  // handing changings
  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  //for closing the modal
  handleClose = () => {
    this.setState({ modal: false });
  };

  //  handling the informations submitted by the user

  handleSubmit = event => {
    event.preventDefault();
    if (this.state.channelName === "" && this.state.channelDetails === "") {
      this.setState({ errors: "Please fill all inputs" });
      console.log("Please fill all inputs");
    } else if (this.state.channelName.length < 3) {
      console.log("The channel name must be more than 3 characters");
      this.setState({
        errors: "The channel name must be more than 7 characters "
      });
    } else if (this.state.channelName.length > 25) {
      console.log("The channel name must be less than 25  characters");
      this.setState({
        errors: "The channel name must be les  than 25 characters ",
        nameError: "error"
      });
    } else if (this.state.channelDetails.length < 7) {
      console.log("The channel details  must be more than 7 characters");
      this.setState({
        errors: "The channel descriptions  must be more than 7 characters ",
        detailsErrors: "error"
      });
    } else if (this.state.channelDetails.length > 500) {
      console.log("The channel details must be less  than 500  characters");
      this.setState({
        errors: "The channel name must less more than 500 character ",
        detailsErrors: "error"
      });
    } else {
      this.addChannel();
    }
  };

  // method for setting the active channel

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  // method for displaying channel datas

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    this.setState({
      channel
    });
  };

  // clear notification will remove all notification when the user was not on che channel

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.id
    );

    if (index !== -1) {
      let updadatedNotification = [...this.state.notifications];

      updadatedNotification[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updadatedNotification[index].count = 0;
      this.setState({ notification: updadatedNotification });
    }
  };

  // get numbers of the notifications
  getNotificationCount = channel => {
    let count = 0;
    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }

      if (count > 0) return count;
    });
  };
  // the function that will be called so that to  add our channel to firebase
  addChannel = () => {
    const { channelRef, channelName, channelDetails, user } = this.state;

    const key = channelRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      channelDetails: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
        mail: user.email
      }
    };
    channelRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.handleClose();
        console.log("Ok");
      })
      .catch(errors => {
        console.log(errors);
      });
  };

  // display channels

  displayChannel = channels =>
    this.state.channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        style={{ opacity: "0.7" }}
        key={channel.id}
        active={channel.id === this.state.activeChannel}
        onClick={() => {
          this.changeChannel(channel);
        }}
        name={channel.name}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" />
              CHANNELS ( {channels.length} )
              <Icon name="add" onClick={this.openModal} />
            </span>

            {/* list of channels  */}
          </Menu.Item>
          {this.displayChannel(channels)}
        </Menu.Menu>
        {/* add channels modal */}
        <Modal basic open={modal} onClose={this.handleClose}>
          <Modal.Header>Add a channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of the channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="Details of the channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" />
              add
            </Button>

            <Button color="red" inverted onClick={this.handleClose}>
              <Icon name="remove" />
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}
export default connect(null, { setCurrentChannel, setPrivateChannel })(Channel);
