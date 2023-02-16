<!-- 
  <<< Author notes: Header of the course >>> 
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses Creative Commons Attribution 4.0 International.
-->

# Introduction to GitHub

_Get started using GitHub in less than an hour._

<!-- 
  <<< Author notes: Start of the course >>> 
  Include start button, a note about Actions minutes,
  and tell the learner why they should take the course.
  Each step should be wrapped in <details>/<summary>, with an `id` set.
  The start <details> should have `open` as well.
  Do not use quotes on the <details> tag attributes.
-->

<details id=0 open>
<summary><h2>Welcome</h2></summary>

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Skills’ “Introduction to GitHub” course guides you through everything you need to start contributing in less than an hour.

<!-- 
  <<< Author notes: Step 1 >>> 
  Choose 3-5 steps for your course.
  The first step is always the hardest, so pick something easy!
  Link to docs.github.com for further explanations.
  Encourage users to open new tabs for steps!
-->

<details id=1>
<summary><h2>Step 1: Create a branch</h2></summary>

### :keyboard: Activity: Your first branch

1. Open a new browser tab, and navigate to this same repository. Then, work on the steps in your second tab while you read the instructions in this tab.
2. Navigate to the **Code** tab.
3. Click on the **main** branch drop-down.<br>
   <img alt="image showing my-first-branch entry" src="/images/my-first-branch.png"/>
4. In the field, enter a name for your branch: `my-first-branch`.
5. Click **Create branch: my-first-branch** to create your branch.
6. Move on to Step 2!<br>
   **Note**: If you made a public repository, and want to confirm you correctly set up your first branch, wait about 20 seconds then refresh this page (the one you're following instructions from). [GitHub Actions](https://docs.github.com/en/actions) will automatically close this step and open the next one.

</details>

<!-- 
  <<< Author notes: Step 2 >>>
  Start this step by acknowledging the previous step.
  Define terms and link to docs.github.com.
-->

<details id=2>
<summary><h2>Step 2: Commit a file</h2></summary>

_You created a branch! :tada:_

Creating a branch allows you to edit your project without changing the `main` branch. Now that you have a branch, it’s time to create a file and make your first commit!

**What is a commit?**: A [commit](https://docs.github.com/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits) is a set of changes to the files and folders in your project. A commit exists in a branch.

### :keyboard: Activity: Your first commit

The following steps will guide you through the process of committing a change on GitHub. Committing a change requires first adding a new file to your new branch. 

1. On the **Code** tab, make sure you're on your new branch `my-first-branch`.
2. Select the **Add file** drop-down and click **Create new file**.<br>
   ![create new file option](/images/create-new-file.png)
3. In the **Name your file...** field, enter `PROFILE.md`.
4. In the **Edit new file** area, copy the following content to your file:
   ```
   Welcome to my GitHub profile!
   ```
   <img alt="profile.md file screenshot" src="/images/my-profile-file.png"/>
5. For commits, you can enter a short commit message that describes what changes you made. This message helps others know what's included in your commit. GitHub offers a simple default message, but let's change it slightly for practice. First, enter `Add PROFILE.md` in the first text-entry field below **Commit new file**. Then, if you want to confirm what your screen should look like, expand the dropdown below.
   <details>
   <summary> Expand to see the screenshot.</summary>
   <img alt="screenshot of adding a new file with a commit message" src="/images/commit-full-screen.png" />
   </details>
6. In this lesson, we'll ignore the other fields and click **Commit new file**.
7. Move on to Step 3! <br>
   **Note**: Like before, you can wait about 20 seconds, then refresh this page (the one you're following instructions from) and [GitHub Actions](https://docs.github.com/en/actions) will automatically close this step and open the next one.

</details>

<!-- 
  <<< Author notes: Step 3 >>> 
  Just a historic note: the previous version of this step forced the learner
  to write a pull request description,
  checked that `main` was the receiving branch,
  and that the file was named correctly.
-->

<details id=3>
<summary><h2>Step 3: Open a pull request</h2></summary>

_Nice work making that commit :sparkles:_

Now that you’ve created a commit, it’s time to share your proposed change through a pull request!

**What is a pull request?**: Collaboration happens on a pull request. The pull request shows the changes in your branch to other people. This pull request is going to keep the changes you just made on your branch and propose applying them to the `main` branch.
<br>:tv: [Video: Introduction to pull requests](https://youtu.be/kJr-PIfLDl4)

### :keyboard: Activity: Create a pull request

You may have noticed after your commit that a message displayed indicating your recent push to your branch and providing a button that says **Compare & pull request**.

![screenshot of message and button](/images/compare-and-pull-request.png)

 If you want, feel free to click **Compare & pull request**, and then skip to step 6 below. If you don't click the button, the instructions below walk you through manually setting up the pull request.

1. Click on the **Pull requests** tab in your repository.
2. Click **New pull request**.
3. In the **base:** dropdown, make sure **main** is selected.
4. Select the **compare:** dropdown, and click `my-first-branch`. <br>
   <img alt="screenshot showing both branch selections" src="/images/pull-request-branches.png"/>
5. Click **Create pull request**.
6. Enter a title for your pull request: `Add my first file`.
7. The next field helps you provide a description of the changes you made. Feel free to add a description of what you’ve accomplished so far. As a reminder, you have: created a branch, created a file and made a commit! <br>
   <img alt="screenshot showing pull request" src="/images/Pull-request-description.png"/>
8. Click **Create pull request**.
9. Move on to Step 4! <br>
   **Note**: Like before, you can wait about 20 seconds, then refresh this page (the one you're following instructions from) and [GitHub Actions](https://docs.github.com/en/actions) will automatically close this step and open the next one. As a perk, you may see evidence of GitHub Actions running on the tab with the pull request opened! The image below shows a line you might see on your pull request after the Action finishes running.<br>
   <img alt="screenshot of an example of an actions line" src="/images/Actions-to-step-4.png"/>

</details>

<!-- 
  <<< Author notes: Step 4 >>> 
  Just a historic note: The previous version of this step required responding
  to a pull request review before merging. The previous version also handled
  if users accidentally closed without merging.
-->

<details id=4>
<summary><h2>Step 4: Merge your pull request</h2></summary>

_Nicely done friend! :sunglasses:_

You successfully created a pull request. You can now merge your pull request.

**What is a _merge_**: A [merge](https://docs.github.com/en/get-started/quickstart/github-glossary#merge) adds the changes in your pull request and branch into the `main` branch.
<br>:tv: [Video: Understanding the GitHub flow](https://www.youtube.com/watch?v=PBI2Rz-ZOxU)

As noted in the previous step, you may have seen evidence of an action running which automatically progresses your instructions to the next step. You'll have to wait for it to finish before you can merge your pull request. It will be ready when the merge pull request button is green.

![screenshot of green merge pull request button](/images/Green-merge-pull-request.png)
### :keyboard: Activity: Merge the pull request

1. Click **Merge pull request**.
1. Click **Confirm merge**.
1. Once your branch has been merged, you don't need it anymore. To delete this branch, click **Delete branch**.<br>
   <img alt="screenshot showing delete branch button" src="/images/delete-branch.png"/>
2. Check out the **Finish** step to see what you can learn next!<br>
   **Note**: Like before, you can wait about 20 seconds, then refresh this page (the one you're following instructions from) and [GitHub Actions](https://docs.github.com/en/actions) will automatically close this step and open the next one.

</details>

<!-- 
  <<< Author notes: Finish >>> 
  Review what we learned, ask for feedback, provide next steps.
-->

<details id=X>
<summary><h2>Finish</h2></summary>

_Congratulations friend, you've completed this course and joined the world of developers!_

<img src=https://octodex.github.com/images/collabocats.jpg alt=celebrate width=300 align=right>

</details>

<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

&copy; 2022 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [CC-BY-4.0 License](https://creativecommons.org/licenses/by/4.0/legalcode)
