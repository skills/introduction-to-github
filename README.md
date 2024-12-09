

<header>

# Introduction to GitHub

_Get started using GitHub in less than an hour._

</header>

## Welcome

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Skills’ “Introduction to GitHub” course guides you through everything you need to start contributing in less than an hour.

- **Who is this for**: New developers, new GitHub users, and students.
- **What you'll learn**: We'll introduce repositories, branches, commits, and pull requests.
- **What you'll build**: We'll make a short Markdown file you can use as your [profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
- **Prerequisites**: None. This course is a great introduction for your first day on GitHub.
- **How long**: This course takes less than one hour to complete.

In this course, you will:

1. Create a branch
2. Commit a file
3. Open a pull request
4. Merge your pull request

### How to start this course

[![start-course](https://user-images.githubusercontent.com/1221423/235727646-4a590299-ffe5-480d-8cd5-8194ea184546.svg)](https://github.com/new?template_owner=skills&template_name=introduction-to-github&owner=%40me&name=skills-introduction-to-github&description=My+clone+repository&visibility=public)

1. Right-click **Start course** and open the link in a new tab.
2. In the new tab, most of the prompts will automatically fill in for you.
   - For owner, choose your personal account or an organization to host the repository.
   - We recommend creating a public repository, as private repositories will [use Actions minutes](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
   - Scroll down and click the **Create repository** button at the bottom of the form.
3. After your new repository is created, wait about 20 seconds, then refresh the page. Follow the step-by-step instructions in the new repository's README.

### Example of Add Check Bot for Project Maintainers

#### Bot Logic:
```python
import discord
from discord.ext import commands

bot = commands.Bot(command_prefix='!')

maintainers = {
    "Teachmastermindpat": {"project": "AfricaCryptoChainx", "sponsorship": 100},
    "maintainerUsername1": {"project": "AfricaCryptoChainx ABC", "sponsorship": 100},
    "maintainerUsername2": {"project": "AfricaCryptoChainx DEF", "sponsorship": 100}
}

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def add_maintainer(ctx, username, project, sponsorship):
    if username in maintainers:
        await ctx.send(f'{username} already exists in the list.')
    else:
        maintainers[username] = {"project": project, "sponsorship": sponsorship}
        await ctx.send(f'{username} added successfully with project {project} and sponsorship {sponsorship}.')

bot.run('YOUR_DISCORD_BOT_TOKEN')
```

### Additional Project Roles:
```
MaintainRole
Always allow
Select bypass mode

WriteRole
Always allow
Select bypass mode

Dependabot
DependabotApp • GitHub
Always allow
Select bypass mode

Imgbot
ImgbotApp
Always allow
Select bypass mode
```

### Project Information:
The **AfricaCryptoChainx-Ccxt-wallet** feature integrates within the app, using free tools and bots for secure, real-time cryptocurrency transactions. Powered by open-source technology, it supports financial inclusion and blockchain transparency. Learn more at [AfricaCryptoChainx](https://africacryptochainx.com).

### Utilizing GitHub Actions, CodeQL, and Python

#### GitHub Actions Workflow:
Create a GitHub Actions workflow to automate your project tasks.

```yaml
name: AfricaCryptoChainx Workflow

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run tests
        run: python -m unittest discover
```

#### CodeQL Analysis:
Add CodeQL to analyze your code for vulnerabilities.

```yaml
name: CodeQL

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 3 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        language: [ 'python' ]
        # CodeQL supports [ 'cpp', 'csharp', 'go', 'java', 'javascript', 'typescript', 'python', 'ruby' ]
        # Learn more: https://aka.ms/CodeQL-Docs

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: ${{ matrix.language }}

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
```

---

<footer>

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/introduction-to-github) • [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2024 GitHub • [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) • [MIT License](https://gh.io/mit)

</footer>

 [Otobupatrick9171_AfricaCryptoChainx-Core-Innovator._b5f298.json](https://github.com/user-attachments/files/18066755/Otobupatrick9171_AfricaCryptoChainx-Core-Innovator._b5f298.json)
[AfricaCryptoChainx.csv](https://github.com/user-attachments/files/18066754/AfricaCryptoChainx.csv)
[TeachmastermindPat.csv](https://github.com/user-attachments/files/18066753/TeachmastermindPat.csv)
[github-recovery-codes (1).txt](https://github.com/user-attachments/files/18066752/github-recovery-codes.1.txt)
[TeachMastermindPati_TeachMastermindPati_fa4f00.json](https://github.com/user-attachments/files/18066751/TeachMastermindPati_TeachMastermindPati_fa4f00.json)
[AfricaCryptoChainx .csv](https://github.com/user-attachments/files/18066750/AfricaCryptoChainx.csv)
[export-AfricaCryptoChainx.csv](https://github.com/user-attachments/files/18066749/export-AfricaCryptoChainx.csv)
[export-ACCX-1732968226.json.gz](https://github.com/user-attachments/files/18066748/export-ACCX-1732968226.json.gz)
[export-ACCX-1732968247.csv.gz](https://github.com/user-attachments/files/18066747/export-ACCX-1732968247.csv.gz)
[log.txt](https://github.com/user-attachments/files/18066736/log.txt)
[export-ACCX-1733107835.csv](https://github.com/user-attachments/files/18066735/export-ACCX-1733107835.csv)
[logs_28517974983.zip](https://github.com/user-attachments/files/18066734/logs_28517974983.zip)
[organization_security_risk_AfricaCryptoChainx-Innovator_2024-12-06T14h08m12s.csv](https://github.com/user-attachments/files/18066733/organization_security_risk_AfricaCryptoChainx-Innovator_2024-12-06T14h08m12s.csv)
[Alien Innovation Ruleset.json](https://github.com/user-attachments/files/18066732/Alien.Innovation.Ruleset.json)
<header>

<!--
  <<< Author notes: Course header >>>
  Include a 1280×640 image, course title in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Add your open source license, GitHub uses MIT license.
-->

# Introduction to GitHub

_Get started using GitHub in less than an hour._

</header>

<!--
  <<< Author notes: Course start >>>
  Include start button, a note about Actions minutes,
  and tell the learner why they should take the course.
-->

## Welcome

People use GitHub to build some of the most advanced technologies in the world. Whether you’re visualizing data or building a new game, there’s a whole community and set of tools on GitHub that can help you do it even better. GitHub Skills’ “Introduction to GitHub” course guides you through everything you need to start contributing in less than an hour.

- **Who is this for**: New developers, new GitHub users, and students.
- **What you'll learn**: We'll introduce repositories, branches, commits, and pull requests.
- **What you'll build**: We'll make a short Markdown file you can use as your [profile README](https://docs.github.com/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme).
- **Prerequisites**: None. This course is a great introduction for your first day on GitHub.
- **How long**: This course takes less than one hour to complete.

In this course, you will:

1. Create a branch
2. Commit a file
3. Open a pull request
4. Merge your pull request

### How to start this course

<!-- For start course, run in JavaScript:
'https://github.com/new?' + new URLSearchParams({
  template_owner: 'skills',
  template_name: 'introduction-to-github',
  owner: '@me',
  name: 'skills-introduction-to-github',
  description: 'My clone repository',
  visibility: 'public',
}).toString()
-->

[![start-course](https://user-images.githubusercontent.com/1221423/235727646-4a590299-ffe5-480d-8cd5-8194ea184546.svg)](https://github.com/new?template_owner=skills&template_name=introduction-to-github&owner=%40me&name=skills-introduction-to-github&description=My+clone+repository&visibility=public)

1. Right-click **Start course** and open the link in a new tab.
2. In the new tab, most of the prompts will automatically fill in for you.
   - For owner, choose your personal account or an organization to host the repository.
   - We recommend creating a public repository, as private repositories will [use Actions minutes](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions).
   - Scroll down and click the **Create repository** button at the bottom of the form.
3. After your new repository is created, wait about 20 seconds, then refresh the page. Follow the step-by-step instructions in the new repository's README.

<footer>

<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/orgs/skills/discussions/categories/introduction-to-github) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2024 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
