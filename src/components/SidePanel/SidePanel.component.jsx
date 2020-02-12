import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel.component";
import Channel from "./Channel.component";
import DirectMessages from "./DirectMessages.component";
import Starred from "./Starred.component";
class SidePanel extends Component {
  render() {
    const { secondaryColor, primaryColor } = this.props;
    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: primaryColor && primaryColor, fontSize: "1.1rem" }}
      >
        {/* // userPasnel component to show all users */}
        <UserPanel
          secondaryColor={secondaryColor}
          primaryColor={primaryColor}
          currentUser={this.props.currentUser}
          style={{ overflow: "scroll" }}
        />
        {/*  starred to know favourite channel  */}
        <Starred
          currentUser={this.props.currentUser}
          style={{ overflow: "scroll" }}
        />
        {/* channel pannel to show what is going on, on the channel */}
        <Channel
          currentUser={this.props.currentUser}
          style={{ overflow: "scroll" }}
        />

        {/* Direct message channel, to allows users to send messages each other directly */}
        <DirectMessages
          currentUser={this.props.currentUser}
          style={{ overflow: "scroll" }}
        />
      </Menu>
    );
  }
}

export default SidePanel;
