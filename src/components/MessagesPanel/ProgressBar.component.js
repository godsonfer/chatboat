import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, percentUploaded }) =>
  uploadState && (
    <Progress
      className="progress__bar"
      percent={percentUploaded}
      indicating
      progress
      size="medium"
      inverted
    />
  );

export default ProgressBar;
