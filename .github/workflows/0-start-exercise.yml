name: Step 0 # Start Exercise

on:
  push:
    branches:
      - main

permissions:
  contents: write # Update Readme
  actions: write # Disable/enable workflows
  issues: write # Create issue and comment on issues

env:
  STEP_1_FILE: ".github/steps/1-create-a-branch.md"

jobs:
  start_exercise:
    if: |
      !github.event.repository.is_template
    name: Start Exercise
    uses: skills/exercise-toolkit/.github/workflows/start-exercise.yml@v0.8.1
    with:
      exercise-title: "Introduction to GitHub"
      intro-message: "If you are new to GitHub, you might find your fellow developers use ___**issues**___  to organize their work and collaborate. We will do the same! That's another lesson, but today, we will introduce you to the basics."

  post_next_step_content:
    name: Post next step content
    runs-on: ubuntu-latest
    needs: [start_exercise]
    env:
      ISSUE_REPOSITORY: ${{ github.repository }}
      ISSUE_NUMBER: ${{ needs.start_exercise.outputs.issue-number }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: main

      - name: Get response templates
        uses: actions/checkout@v4
        with:
          repository: skills/exercise-toolkit
          path: exercise-toolkit
          ref: v0.7.0

      - name: Create comment - add step content
        uses: GrantBirki/comment@v2.1.1
        with:
          repository: ${{ env.ISSUE_REPOSITORY }}
          issue-number: ${{ env.ISSUE_NUMBER }}
          file: ${{ env.STEP_1_FILE }}

      - name: Create comment - watching for progress
        uses: GrantBirki/comment@v2.1.1
        with:
          repository: ${{ env.ISSUE_REPOSITORY }}
          issue-number: ${{ env.ISSUE_NUMBER }}
          file: exercise-toolkit/markdown-templates/step-feedback/watching-for-progress.md

      - name: Disable current workflow and enable next one
        run: |
          gh workflow enable "Step 1"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
