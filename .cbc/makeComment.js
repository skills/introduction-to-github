const { Octokit } = require("@octokit/core");

const makeComment = async (authToken, issueNumber, comment) => {
  const octokit = new Octokit({ auth: authToken });
  const response = await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner: "BYUComputingBootCampTests",
    repo: "githubTest",
    issue_number: issueNumber,
    body: comment
  });

}

// Start
var authToken = process.argv[2];
var issueNumber = process.argv[3];
var comment = process.argv[4];
makeComment(authToken, issueNumber, comment);