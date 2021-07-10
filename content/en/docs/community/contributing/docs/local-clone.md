---
layout: single
title: Make a Change Using a Local Clone
---

To make significant changes to a Spinnaker service or other repository, you can fork the repository and work from a local clone. The workflow below walks through a change to the `spinnaker/spinnaker.io` repository as an example, but a fork-and-pull-request workflow should be used for all Spinnaker contributions. Make sure you have [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your computer and have configured your GitHub account. See the [GitHub Help](https://help.github.com) for details.

## Fork the repository

1. Navigate to the `spinnaker/spinnaker.io` [repository](https://github.com/spinnaker/spinnaker.io) with a web browser.
1. Click **Fork**.

## Create a local repository and set the upstream repository

1. In a terminal window, clone your fork:

   ```bash
   git clone git@github.com:<github-username>/spinnaker.io.git
   ```

1. Navigate to the new `spinnaker.io` directory. Set the `spinnaker/spinnaker.io` repository as the `upstream` remote:

   ```bash
   cd spinnaker.io

   git remote add upstream https://github.com/spinnaker/spinnaker.io.git
   ```

1. Confirm your `origin` and `upstream` repositories:

   ```bash
   git remote -v
   ```

   Output is similar to:

   ```bash
   origin	git@github.com:<github-username>/spinnaker.io.git (fetch)
   origin	git@github.com:<github-username>/spinnaker.io.git (push)
   upstream	https://github.com/spinnaker/spinnaker.io.git (fetch)
   upstream	https://github.com/spinnaker/spinnaker.io.git (push)
   ```

## Update your local repository

Make sure your local repository is current before you start making changes. Fetch commits from your fork's `origin/master` and `spinnaker/spinnaker.io`'s `upstream/master`:

```bash
git fetch origin
git fetch upstream
```

## Create a working branch

1. Make sure you are in your `master` branch before you create your working
   branch. You can use `git branch` to see which branch you are in.

   ````bash
   	git branch
   	```

   	The output lists your local branches. There is an `*` next to the branch you are in.

   	```bash
   working-branch-1
   working-branch-2
   * master
   ````

   If you are not in `master`, execute `git checkout master` to go to your `master` branch. See the [Understanding history: What is a branch?](https://git-scm.com/docs/user-manual#what-is-a-branch) section of the _Git User Manual_ for more information.

1. Create a new working branch based on `upstream/master`.

   ```bash
   git checkout -b <your-working-branch> upstream/master
   ```

   Since `git` tracks changes to `upstream\master`, you don't need to rebase your fork before you create a working branch.

1. Make your changes.

Use the `git status` command at any time to see what files you've changed.

## Test or preview changes locally

Once you have made changes, the next step is to test your changes in action. How you do this will
depend on the resource you changed and the resources it interacts with.

If you make changes to `spinnaker/spinnaker.io` and want to preview them locally, install [Hugo](https://gohugo.io/getting-started/installing/). Run this command from the repo root:

```
hugo server
```

## Commit your changes

1. Check which files you need to commit:

   ```bash
   git status
   ```

   Output is similar to:

   ```bash
   On branch <your-working-branch>
   Changes not staged for commit:
   (use "git add <file>..." to update what will be committed)
   (use "git restore <file>..." to discard changes in working directory)

   modified:   _data/navigation.yml

   Untracked files:
   (use "git add <file>..." to include in what will be committed)

   community/contributing/docs/local-clone.md

   no changes added to commit (use "git add" and/or "git commit -a")
   ```

1. Add new files listed under **Untracked files** to the commit:

   ```bash
   git add <path/your-file-name>
   ```

   Repeat this for each new file.

1. Create a commit:

   ```bash
   git commit -a -m "<your-commit-subject>" -m "<your-commit-description>"
   ```

   - `-a`: Commit all staged changes.
   - `-m`: Use the given `<your-commit-subject>` as the commit message. If multiple `-m` options are given, their values are concatenated as separate paragraphs.

   Your commit messages must be 50 characters or less. Do not use any [GitHub
   Keywords](https://help.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword) in your commit message. You can add those to the pull request description later.

1. Push your working branch and its new commit to your remote fork:

   ```bash
   git push origin <your-working-branch>
   ```

   You can commit and push many times before you create your PR.

## Create a pull request from your fork to spinnaker/spinnaker.io

1. In a web browser, go to the `spinnaker/spinnaker.io` [repository](https://github.com/spinnaker/spinnaker.io). You should see your recently pushed working branch with a **Compare & pull request** button.

1. Click **Compare & pull request**. This takes you to the **Open a pull request** screen.

   1. The **Title** defaults to the commit subject. Update the title so it follows the `<type>(<scope>): <subject>` format. Make sure you include a space after the colon. For example:

      ```
      docs(plugins): add documentation for plugin creators
      ```

      The Spinnaker repositories use a PR title checker, so your PR will fail if the title is not in the correct format. For more information, see [commit message conventions]({{< ref "submitting#commit-message-conventions" >}}).

   2. The **Leave a comment** field defaults to the commit description. Pull request descriptions are the first step to helping reviewers and project maintainers understand why your change was made. Do not leave this field blank. Provide as much description as possible. A good description helps get your PR merged faster!
   3. Leave the **Allow edits from maintainers** checkbox selected.

1. Click the **Create pull request** button.

Congratulations! You can view your submitted pull request on the **Pull requests** [tab](https://github.com/spinnaker/spinnaker.io/pulls).

> Do not delete your working branch until your pull request has been merged! You may need to update your content based on reviewer feedback.

When you look at your PR, you may see a **This branch is out-of-date with the base branch** message. This means approvers merged PRs while you were working on your changes. If you see a **Merge conflict** message, you need to [rebase your PR](#merge-conflicts-and-rebasing).

## Addressing feedback locally

Reviewers may ask you to make changes to your pull request. Read the feedback and make changes in your working branch.

1. After making your changes, create a new commit:

   ```bash
   git commit -a -m "<your-commit-subject>" -m "<your-commit-description>"
   ```

1. Push your changes:

   ```bash
   git push origin <your-working-branch>
   ```

## Changes from reviewers

Sometimes reviewers commit changes to your pull request. Fetch those commits before making any other changes.

1. Fetch commits from your remote fork and rebase your working branch:

   ```bash
   git fetch origin
   git rebase origin/<your-working-branch>
   ```

1. After rebasing, force-push new changes to your fork:

   ```bash
   git push --force-with-lease origin <your-working-branch>
   ```

## Merge conflicts and rebasing

If another contributor commits changes to the same file in another PR, it can create a merge conflict. You must resolve all merge conflicts in your PR.

1. Update your fork and rebase your working branch:

   ```bash
   git fetch origin
   git rebase origin/<your-working-branch>
   ```

   Then force-push the changes to your fork:

   ```bash
   git push --force-with-lease origin <your-working-branch>
   ```

1. Fetch changes from `spinnaker/spinnaker.io`'s `upstream/master` and rebase your branch:

   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

1. Inspect the results of the rebase:

   ```bash
   git status
   ```

This results in a number of files marked as conflicted.

1. Open each conflicted file and look for the conflict markers: `>>>`, `<<<`, and `===`. Resolve the conflict and delete the conflict marker.

   > For more information, see [How conflicts are presented](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented).

1. Add the files to the changeset:

   ```bash
   git add <filename>
   ```

1. Continue the rebase:

```bash
git rebase --continue
```

1.  Repeat steps 2 to 5 as needed.

After applying all commits, the `git status` command shows that the rebase is complete.

1. Force-push your working branch to your remote fork:

   ```bash
   git push --force-with-lease origin <your-working-branch>
   ```

   The pull request no longer shows any conflicts.

> For more information, see [Git Branching - Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts), [Advanced Merging](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging), or ask in the `#sig-documentation` Slack channel for help.
