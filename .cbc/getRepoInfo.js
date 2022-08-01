const { Octokit } = require("@octokit/core");

const getRepoInfo = async (authToken, infoNeeded) => {
  const octokit = new Octokit({ auth: authToken });
  const response = await octokit.request("GET /repos/{owner}/{repo}/pulls?state=open", {
    owner: "BYUComputingBootCampTests",
    repo: "githubTest"
  });

  let index = 0;
  //While there are still repositories that are open
  while (response.data.length > index) {
    //If the repository doesn't have a "currently being checked" label
    let label = "hi";
    if (response.data[index].labels.length != 0) {
      label = response.data[index].labels[0];
    }
    if (response.data[index].labels.length == 0 || label.name.toString().localeCompare("currentlyBeingChecked") != 0) {
      if (infoNeeded.toString().localeCompare('full_name') == 0) {
        repoInfo = response.data[index].head.repo.full_name;
        process.stdout.write(repoInfo);
        return;
      } else {
        repoInfo = response.data[index].number;
        var repoNumber = repoInfo.toString();
        process.stdout.write(repoNumber);
        return;
      }
    }
    index++;
  }
  throw "No Repositories waiting to be checked";
}

var authToken = process.argv[2];
var infoNeeded = process.argv[3];
getRepoInfo(authToken, infoNeeded);
