const { Octokit } = require("@octokit/core");

const getFile = async (authToken, repoInfo, filePath) => {
    const octokit = new Octokit({auth: authToken});
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: repoInfo[0],
        repo: repoInfo[1],
        path: filePath
      })
      
    console.log(Buffer.from(response.data.content, 'base64').toString('binary'));
}

var authToken = process.argv[2];
var repoInfo = process.argv[3].split("/");
var filePath = process.argv[4];
getFile(authToken, repoInfo, filePath);
