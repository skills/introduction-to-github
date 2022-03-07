<!-- 
  <<< Author notes: Header of the course >>> 
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses Creative Commons Attribution 4.0 International.
-->

<img src=https://user-images.githubusercontent.com/1221423/156946910-a79dadd3-b4b6-4ca3-97bd-98ff8b3afc72.svg width=300 align=right>

# Introduction to GitHub

_This quick and fun introduction will get you started using GitHub in less than an hour._

<!-- 
  <<< Author notes: Start of the course >>> 
  Include start button, a note about Actions minutes,
  and tell the learner why they should take the course.
  Each step should be wrapped in <details>/<summary>, with an `id` set.
  The start <details> should have `open` as well.
  Do not use quotes on the <details> tag attributes.
-->

<details id=0 open>
<summary><h2>:golf: Start</h2></summary>
  
[![start-course](https://user-images.githubusercontent.com/1221423/154366775-5491926f-9ed1-4a4a-a229-0810c0ed7e5e.svg)](https://github.com/githublearn/introduction-to-github/generate)

> When you select **Start course** or **Use this template**, you will be prompted to create a new repository.
> We recommend creating a public repository, as private repositories will [use Actions minutes](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions).<br>
> <em>Optional:</em> For this course, set "owner" and "repository name" to your login name.<br>
> After you make your own repository, wait about 20 seconds and refresh. I will go to the next step.

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Learn’s “Introduction to GitHub” course guides you through everything you need to start contributing in less than an hour.

- **Who is this for**: New developers, new GitHub users, and students.
- **What you'll learn**: We'll introduce repositories, branches, commits, and pull requests.
- **What you'll build**: We'll make a short Markdown file you can use as your [profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
- **Prerequisites**: None. This course is a great introduction for your first day on GitHub.
- **How long**: This course is four steps long and takes less than one hour to complete.

</details>

<!-- 
  <<< Author notes: Step 1 >>> 
  Choose 3-5 steps for your course.
  The first step is always the hardest, so pick something easy!
  Link to docs.github.com for further explanations.
  Encourage users to open new tabs for steps!
-->

<details id=1>
<summary><h2>:evergreen_tree: Step 1: Create a branch</h2></summary>

_Welcome to "Introduction to GitHub"! :wave:_

**What is GitHub?**: GitHub is a collaboration platform that uses [Git](https://docs.github.com/get-started/quickstart/github-glossary#git) for versioning. GitHub is a popular place to share and contribute to [open-source](https://docs.github.com/get-started/quickstart/github-glossary#open-source) software.
<br>:tv: [Video: What is GitHub?](https://www.youtube.com/watch?v=w3jLJU7DT5E)

**What is a repository?**: A [repository](https://docs.github.com/get-started/quickstart/github-glossary#repository) is a project containing files and folders. A repository tracks versions of files and folders.
<br>:tv: [Video: Exploring a repository](https://www.youtube.com/watch?v=R8OAwrcMlRw)

**What is a branch?**: A [branch](https://docs.github.com/en/get-started/quickstart/github-glossary#branch) is a parallel version of your repository. You can make edits in your branch without impacting the `main` version. Branches allow us to separate our work from the `main` branch. In other words, everyone's work is safe while you contribute.
<br>:tv: [Video: Branches](https://www.youtube.com/watch?v=xgQmu81G1yY)

### :keyboard: Activity: Your first branch

1. Open a new browser tab, and work on the steps in your second tab while you read the instructions in this tab.
1. Navigate to the **Code** tab.
1. Click **Branch: main** in the drop-down.
1. In the field, enter a name for your branch: `my-first-branch`.
1. Click **Create branch: my-first-branch** or press the <kbd>Enter</kbd> key to create your branch.
1. Wait about 20 seconds then refresh this page for the next step.

</details>

<!-- 
  <<< Author notes: Step 2 >>>
  Start this step by acknowledging the previous step.
  Define terms and link to docs.github.com.
-->

<details id=2>
<summary><h2>:pencil: Step 2: Commit a file</h2></summary>

_You created a branch! :tada:_

Creating a branch allows you to edit to your project without changing the `main` branch. Now that you have a branch, it’s time to create a file and make your first commit!

**What is a commit?**: A [commit](https://docs.github.com/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits) is a set of changes to the files and folders in your project. A commit exists in a branch.

### :keyboard: Activity: Your first commit

The following steps will guide you through the process of committing a change on GitHub.

1. Create a new file on this branch called `PROFILE.md`.
   - Make sure you are on the "Code" tab.
   - In the branch drop-down, select `my-first-branch`.
   - Click **Create new file**.
   - In the "file name" field, type `PROFILE.md`.
1. When you’re done naming the file, add the following content to your file:
   ```md
   Welcome to my GitHub profile!
   ```
1. After adding the text, you can commit the change by entering a brief commit message `Add PROFILE.md` in the text-entry field below the file edit view.
1. After you’ve entered a commit message, click **Commit new file**.
1. Wait about 20 seconds then refresh this page for the next step.

</details>

<!-- 
  <<< Author notes: Step 3 >>> 
  Just a historic note: the previous version of this step forced the learner
  to write a pull request description,
  checked that `main` was the receiving branch,
  and that the file was named correctly.
-->

<details id=3>
<summary><h2>:raised_hands: Step 3: Open a pull request</h2></summary>

_Nice work making that commit :sparkles:_

Now that you’ve created a commit, it’s time to share your proposed change through a pull request!

**What is a pull request?**: Collaboration happens on a pull request. The pull request shows the changes in your branch to other people. This pull request is going to keep the changes you just made on your branch and propose applying them to the `main` branch.
<br>:tv: [Video: Introduction to pull requests](https://youtu.be/kJr-PIfLDl4)

### :keyboard: Activity: Create a pull request

1. Open a pull request:
   - From the "Pull requests" tab, click **New pull request**.
   - In the "base:" drop-down menu, make sure the "main" branch is selected.
   - In the "compare:" drop-down menu, select `my-first-branch`.
1. When you’ve selected your branch, enter a title for your pull request: `Add my first file`.
1. The next field helps you provide a description of the changes you made. Feel free to add a description of what you’ve accomplished so far. As a reminder, you have: created a branch, created a file and made a commit, and opened a pull request.
1. Click **Create pull request**.
1. Wait about 20 seconds then refresh this page for the next step.

</details>

<!-- 
  <<< Author notes: Step 4 >>> 
  Just a historic note: The previous version of this step required responding
  to a pull request review before merging. The previous version also handled
  if users accidentally closed without merging.
-->

<details id=4>
<summary><h2>:chipmunk: Step 4: Merge your pull request</h2></summary>

_Nicely done friend! :sunglasses:_

You successfully created a pull request. You can now merge your pull request.

**What is a _merge_**: A [merge](https://docs.github.com/en/get-started/quickstart/github-glossary#merge) adds the changes in your pull request and branch into the `main` branch.
<br>:tv: [Video: Understanding the GitHub flow](https://www.youtube.com/watch?v=PBI2Rz-ZOxU)

### :keyboard: Activity: Merge the pull request

1. Click **Merge pull request**.
1. Click **Confirm merge**.
1. Once your branch has been merged, you don't need it anymore and you may click **Delete branch**.
1. Wait about 20 seconds then refresh this page for the next step.

</details>

<!-- 
  <<< Author notes: Finish >>> 
  Review what we learned, ask for feedback, provide next steps.
-->

<details id=X>
<summary><h2>:checkered_flag: Finish</h2></summary>

_Congratulations friend, you've completed this course!_

<img src=https://octodex.github.com/images/collabocats.jpg alt=celebrate width=300 align=right>

Here's a recap of all the tasks you've accomplished in your repository:

- You learned about GitHub, repositories, branches, commits, and pull requests.
- You created a branch, a commit, and a pull request.
- You merged a pull request.
- You made your first contribution! :tada:

### What's next?

- If you'd like the contents of your `PROFILE.md` file to be on your GitHub profile:
  - Make a new branch.
  - Edit the contents into this `README.md` file.
  - Delete `PROFILE.md` on your branch.
  - Open and merge a pull request using your branch.
- We'd love to hear what you thought of this course [in our community forum](https://github.community/c/education/github-learning-lab/34).
- [Take another GitHub Learn course](https://github.com/githublearn).
- [Read the GitHub Getting Started docs](https://docs.github.com/en/get-started).
- To find projects to contribute to, check out [GitHub Explore](https://github.com/explore).

</details>

<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our community forum](https://github.community/c/education/github-learning-lab/34) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2022 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [CC-BY-4.0 License](https://creativecommons.org/licenses/by/4.0/legalcode)
