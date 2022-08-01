const { Octokit } = require("@octokit/core");

const triggerRunForAllPRs = async (authToken) => {
  const octokit = new Octokit({ auth: authToken });
  const response = await octokit.request("GET /repos/{owner}/{repo}/pulls?state=open", {
    owner: "BYUComputingBootCampTests",
    repo: "githubTest"
  });

  console.log(response)
  var numberOfPRs = response.data.length;
  if (numberOfPRs > 12) numberOfPRs = 12; //So that the github action doesn't overlap with the next scheduled round
  for (let i = 0; i < numberOfPRs; i++) {
    const octokitMakeTest = new Octokit({ auth: authToken });
    const responseNew = await octokitMakeTest.request("POST /repos/{owner}/{repo}/dispatches", {
      owner: "BYUComputingBootCampTests",
      repo: "githubTest",
      event_type: "test_pr"
    });
    sleep(10000); //Wait 10 seconds so the last workflow has time to label the PR as "currently being checked"
  }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

// Start
var authToken = process.argv[2];
triggerRunForAllPRs(authToken);
