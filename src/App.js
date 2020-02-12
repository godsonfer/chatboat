import React from "react";

import { Grid } from "semantic-ui-react";

import "./components/App.css";

import ColorPanel from "./components/ColorPanel/ColorPanel.component";
import SidePanel from "./components/SidePanel/SidePanel.component";
import MetaPanel from "./components/MetaPanel/MetaPanel.component";
import MessagesPanel from "./components/MessagesPanel//MessagesPanel.component";
import { connect } from "react-redux";

const App = ({
  currentUser,
  currentChannel,
  isPrivateChannel,
  userPosts,
  secondaryColor,
  primaryColor
}) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    <ColorPanel
      secondaryColor={secondaryColor}
      primaryColor={primaryColor}
      currentUser={currentUser}
      key={currentUser && currentUser.name}
    />

    <SidePanel
      currentUser={currentUser}
      key={currentUser && currentUser.uid}
      secondaryColor={secondaryColor}
      primaryColor={primaryColor}
    />

    <Grid.Column style={{ marginLeft: 320 }}>
      <MessagesPanel
        secondaryColor={secondaryColor}
        primaryColor={primaryColor}
        isPrivateChannel={isPrivateChannel}
        currentChannel={currentChannel}
        currentUser={currentUser}
        key={currentChannel && currentChannel.name}
      />
    </Grid.Column>

    <Grid.Column width={4} style={{ marginRight: 20 }}>
      <MetaPanel
        secondaryColor={secondaryColor}
        primaryColor={primaryColor}
        isPrivateChannel={isPrivateChannel}
        userPosts={userPosts}
        currentChannel={currentChannel}
        key={currentChannel && currentChannel.id}
      />
    </Grid.Column>
  </Grid>
);

const mapStateToProps = state => ({
  isPrivateChannel: state.channel.isPrivateChannel,
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  userPosts: state.channel.userPosts,
  secondaryColor: state.colors.secondaryColor,
  primaryColor: state.colors.primaryColor
});
export default connect(mapStateToProps)(App);
