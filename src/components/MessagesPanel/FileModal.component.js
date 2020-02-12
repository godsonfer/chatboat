import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";
export default class FileModal extends Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"]
  };

  // add file
  addFile = event => {
    const file = event.target.files[0];

    this.setState({ file: file });
  };

  //send file

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;

    if (file !== null) {
      if (this.isauthorized(file.name)) {
        //   send image
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();

        this.clearFIle();
      }
    }
  };

  // it checks if the file is whether png or jpeg

  isauthorized = fileName =>
    this.state.authorized.includes(mime.lookup(fileName));

  // clear the file on the state so that not to commit it twice
  clearFIle = () => this.setState({ file: null });

  render() {
    const { modal, closeModal } = this.props;
    return (
      <Modal basic open={modal}>
        <Modal.Header>Select an image file</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="File types:  jpg, png"
            name="file"
            type="file"
            onChange={this.addFile}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted>
            <Icon name="checkmark box" onClick={this.sendFile} />
            send
          </Button>

          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" inverted />
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
