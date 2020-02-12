import React, { Component } from "react";

import { Header, Segment, Input, Icon } from "semantic-ui-react";

// notice that most properties of this component are handled by MessaesPanal

export class MessagesHeader extends Component {
  render() {
    return (
      <Segment clearing>
        {/* Channel Title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span style={{ color: "blue", fontFamily: "sans-serif" }}>
            {this.props.channelName}

            {!this.props.isPrivateChannel && (
              <Icon
                name={this.props.isChannelStarred ? "star" : "star outline"}
                color={this.props.isChannelStarred ? "yellow" : "black"}
                onClick={this.props.handleStar}
              />
            )}
          </span>
          <Header.Subheader>
            {" "}
            {!this.props.isPrivateChannel && this.props.numUniqueUsers}
          </Header.Subheader>
        </Header>

        {/* channel search input */}
        <Header floated="right">
          <Input
            loading={this.props.seachLoading}
            size="mini"
            icon="search"
            onChange={this.props.handleSearchChange}
            name="searchTerm"
            placeholder="search messages"
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
