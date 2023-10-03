name: Step 0, Welcome

# This step triggers after the learner creates a new repository from the template.
# This workflow updates from step 0 to step 1.

# This will run every time we create push a commit to `main`.
# Reference: https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows
on:
  workflow_dispatch:
  push:
    branches:
      - main

# Reference: https://docs.github.com/en/actions/security-guides/automatic-token-authentication
permissions:
  # Need `contents: read` to checkout the repository.
  # Need `contents: write` to update the step metadata.
  contents: write

jobs:
  # Get the current step to only run the main job when the learner is on the same step.
  get_current_step:
    name: Check current step number
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - id: get_step
        run: |
          echo "current_step=$(cat ./.github/steps/-step.txt)" >> $GITHUB_OUTPUT
    outputs:
      current_step: ${{ steps.get_step.outputs.current_step }}

  on_welcome:
    name: On welcome
    needs: get_current_step

    # We will only run this action when:
    # 1. This repository isn't the template repository.
    # 2. The step is currently 0.
    # Reference: https://docs.github.com/en/actions/learn-github-actions/contexts
    # Reference: https://docs.github.com/en/actions/learn-github-actions/expressions
    if: >-
      ${{ !github.event.repository.is_template
          && needs.get_current_step.outputs.current_step == 0 }}

    # We'll run Ubuntu for performance instead of Mac or Windows.
    runs-on: ubuntu-latest

    steps:
      # We'll need to check out the repository so that we can edit README.md.
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Let's get all the branches.

      # In README.md, switch step 0 for step 1.
      - name: Update to step 1
        uses: skills/action-update-step@v2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          from_step: 0
          to_step: 1
          branch_name: my-first-branch
