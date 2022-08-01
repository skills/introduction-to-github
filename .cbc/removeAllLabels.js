const { Octokit } = require("@octokit/core");

const deleteAllLabels = async (authToken, issueNumber) => {
    const octokit = new Octokit({ auth: authToken });
    const response = await octokit.request("DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels", {
        owner: "BYUComputingBootCampTests",
        repo: "githubTest",
        issue_number: issueNumber
    });
}

// Start
var authToken = process.argv[2];
var issueNumber = process.argv[3];
deleteAllLabels(authToken, issueNumber);