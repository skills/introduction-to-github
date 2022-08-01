const { Octokit } = require("@octokit/core");

const addLabel = async (authToken, issueNumber, labelToAdd) => {
  const octokit = new Octokit({ auth: authToken });
  const response = await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
    owner: "BYUComputingBootCampTests",
    repo: "githubTest",
    issue_number: issueNumber,
    labels: [labelToAdd]
  });

}

// Start
var authToken = process.argv[2];
var issueNumber = process.argv[3];
var labelToAdd = process.argv[4];
addLabel(authToken, issueNumber, labelToAdd);